/**
 * scanController.js
 * Full pipeline:
 *   Upload (scanner/fax/photo/upload)
 *   → Cloudinary (original + signature image)
 *   → OCR (Nepali + English)
 *   → Parse all Malpot fields
 *   → Save everything to ScanDocument + Land + Ownership
 */

import cloudinary from "../../config/cloudinary.js";
import { extractTextFromImage } from "../../services/ocrService.js";
import { parseMalpotData, validateMalpotData } from "../../services/malpotParser.js";
import ScanDocument from "../../models/ScanDocument.js";
import Land from "../../models/Land.js";
import Ownership from "../../models/Ownership.js";
import fs from "fs";

const uploadToCloudinary = async (filePath, folder, options = {}) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "auto",
    ...options,
  });
  return result.secure_url;
};

const cleanup = (paths = []) =>
  paths.forEach((p) => { if (p && fs.existsSync(p)) fs.unlinkSync(p); });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scan
// ─────────────────────────────────────────────────────────────────────────────
export const scanMalpot = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No document uploaded." });
  }

  const imagePath = req.file.path;
  // sourceType can be sent in form-data body: "scanner" | "fax" | "photo" | "auto"
  const sourceType = req.body.sourceType || "auto";
  let scanDoc = null;
  let signatureLocalPath = null;

  try {
    // 1. Upload original to Cloudinary
    const fileUrl = await uploadToCloudinary(imagePath, "malpot-scans/originals");
    const fileType = req.file.mimetype.startsWith("image") ? "image" : "pdf";

    // 2. Create ScanDocument in Processing state
    scanDoc = await ScanDocument.create({
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      sourceType,
      status: "Processing",
      uploadedBy: req.user?._id || null,
    });

    // 3. Run OCR — Nepali + English + signature detection
    console.log(`[Scan] OCR starting: ${req.file.originalname} (${sourceType})`);
    const ocrResult = await extractTextFromImage(imagePath, {
      sourceType,
      detectSignature: true,
    });

    const { text, confidence: confidenceScore, words, lines, signature } = ocrResult;
    signatureLocalPath = signature?.signatureImagePath || null;

    if (!text || text.trim().length < 10) {
      await ScanDocument.findByIdAndUpdate(scanDoc._id, { status: "Failed" });
      return res.status(422).json({
        success: false,
        message: "OCR failed — try a higher resolution image.",
        scanDocumentId: scanDoc._id,
      });
    }

    // 4. Upload signature crop to Cloudinary
    let signatureUrl = null;
    if (signature.hasSignature && signatureLocalPath) {
      signatureUrl = await uploadToCloudinary(
        signatureLocalPath,
        "malpot-scans/signatures",
        { public_id: `sig_${scanDoc._id}` }
      );
    }

    // 5. Parse all Malpot fields (Nepali + English labels)
    const parsed = parseMalpotData(text);
    const { isValid, errors: parseErrors } = validateMalpotData(parsed);

    // 6. Upsert Land record
    let relatedLand = null;
    if (parsed.kittaNumber && parsed.district) {
      relatedLand = await Land.findOneAndUpdate(
        { kittaNumber: parsed.kittaNumber, district: parsed.district },
        {
          kittaNumber:      parsed.kittaNumber,
          district:         parsed.district,
          vdc:              parsed.vdc,
          wardNumber:       parsed.wardNumber,
          province:         parsed.province,
          sheet:            parsed.sheet,
          documentNumber:   parsed.documentNumber,
          landType:         parsed.landType,
          areaSystem:       parsed.areaSystem,
          area:             parsed.area,
          taxAmount:        parsed.taxAmount,
          registrationDate: parsed.registrationDate,
          lastScannedAt:    new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 7. Create Ownership record
    let ownership = null;
    if (relatedLand && parsed.owner?.name) {
      ownership = await Ownership.create({
        land:             relatedLand._id,
        ownerName:        parsed.owner.name,
        fatherName:       parsed.owner.fatherName,
        grandFatherName:  parsed.owner.grandFatherName,
        citizenshipNo:    parsed.owner.citizenshipNo,
        address:          parsed.owner.address,
        registrationDate: parsed.registrationDate,
        scanDocumentRef:  scanDoc._id,
        createdBy:        req.user?._id || null,
      });
    }

    // 8. Update ScanDocument — save EVERYTHING
    const finalScan = await ScanDocument.findByIdAndUpdate(
      scanDoc._id,
      {
        extractedText:  text,
        words:          words.slice(0, 500),
        ocrLines:       lines,
        confidenceScore,
        sourceType:     ocrResult.sourceType,

        parsedData: {
          kittaNumber:   parsed.kittaNumber,
          district:      parsed.district,
          ward:          parsed.wardNumber,
          area:          parsed.area?.sqm ? parseFloat(parsed.area.sqm) : null,
          ownerName:     parsed.owner?.name,
          citizenshipNo: parsed.owner?.citizenshipNo,
        },

        // Signature
        hasSignature:     signature.hasSignature,
        signatureUrl,
        signatureBounds:  signature.boundingBox,
        signatureDensity: signature.densityScore,

        parseErrors,
        relatedLand:  relatedLand?._id || null,
        ownershipRef: ownership?._id   || null,
        status: "Completed",
      },
      { new: true }
    ).populate("relatedLand").populate("ownershipRef");

    return res.status(201).json({
      success: true,
      message: isValid
        ? "Document scanned and all data saved."
        : "Scanned with partial data — some fields missing.",
      data: {
        scan:              finalScan,
        land:              relatedLand,
        ownership,
        parseErrors,
        ocrConfidence:     confidenceScore,
        signatureDetected: signature.hasSignature,
        signatureUrl,
      },
    });

  } catch (err) {
    console.error("[scanMalpot]", err);
    if (scanDoc) {
      await ScanDocument.findByIdAndUpdate(scanDoc._id, {
        status: "Failed",
        parseErrors: [err.message],
      }).catch(() => {});
    }
    return res.status(500).json({ success: false, error: err.message });

  } finally {
    cleanup([imagePath, signatureLocalPath]);
  }
};

// GET /api/scans
export const getAllScans = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = req.query.status ? { status: req.query.status } : {};

    const [scans, total] = await Promise.all([
      ScanDocument.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("relatedLand", "kittaNumber district wardNumber")
        .select("-words -ocrLines"),
      ScanDocument.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: scans,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/scans/:id
export const getScanById = async (req, res) => {
  try {
    const scan = await ScanDocument.findById(req.params.id)
      .populate("relatedLand")
      .populate("ownershipRef");
    if (!scan) return res.status(404).json({ success: false, message: "Scan not found." });
    return res.json({ success: true, data: scan });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/scans/:id
export const deleteScan = async (req, res) => {
  try {
    const scan = await ScanDocument.findByIdAndDelete(req.params.id);
    if (!scan) return res.status(404).json({ success: false, message: "Scan not found." });
    return res.json({ success: true, message: "Scan deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};