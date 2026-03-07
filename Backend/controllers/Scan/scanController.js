import cloudinary from "../../config/cloudinary.js";
import { extractTextFromImage } from "../../services/ocrService.js";
import { parseMalpotData } from "../../services/malpotParser.js";
import ScanDocument from "../../models/ScanDocument.js";
import Land from "../../models/Land.js";
import fs from "fs";

export const scanMalpot = async (req, res) => {
  const imagePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document uploaded" });
    }

    // ── 1. Upload original file to Cloudinary ────────────────────────────────
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      folder: "malpot-scans",
      resource_type: "auto",
    });

    const fileUrl = uploadResult.secure_url;
    const fileType = req.file.mimetype.startsWith("image") ? "image" : "pdf";

    // ── 2. Create ScanDocument in "Processing" state ─────────────────────────
    const scanDoc = await ScanDocument.create({
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      status: "Processing",
    });

    // ── 3. Run OCR ───────────────────────────────────────────────────────────
    const { text, confidence: confidenceScore, words } = await extractTextFromImage(imagePath, {
      preprocess: true,
    });

    if (!text || text.trim().length < 20) {
      await ScanDocument.findByIdAndUpdate(scanDoc._id, { status: "Failed" });
      return res.status(422).json({
        message: "OCR failed to extract readable text from the document.",
        scanDocumentId: scanDoc._id,
      });
    }

    // ── 4. Parse Malpot fields ───────────────────────────────────────────────
    const parsed = parseMalpotData(text);

    // Flatten parsedData to match your schema shape
    const parsedData = {
      kittaNumber:   parsed.kittaNumber   || null,
      district:      parsed.district      || null,
      ward:          parsed.wardNumber    || null,
      area:          parsed.area?.sqm     ? parseFloat(parsed.area.sqm) : null,
      ownerName:     parsed.owner?.name   || null,
      citizenshipNo: parsed.owner?.citizenshipNo || null,
    };

    // ── 5. Upsert Land record ────────────────────────────────────────────────
    let relatedLand = null;
    if (parsedData.kittaNumber && parsedData.district) {
      relatedLand = await Land.findOneAndUpdate(
        { kittaNumber: parsedData.kittaNumber, district: parsedData.district },
        {
          ...parsedData,
          lastScannedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // ── 6. Update ScanDocument to Completed ──────────────────────────────────
    const updatedScan = await ScanDocument.findByIdAndUpdate(
      scanDoc._id,
      {
        extractedText: text,
        words: words.slice(0, 500), // cap stored words to avoid huge docs
        parsedData,
        confidenceScore,
        status: "Completed",
        relatedLand: relatedLand?._id || null,
      },
      { new: true }
    ).populate("relatedLand");

    return res.status(201).json({
      message: "Malpot document scanned and saved successfully.",
      data: updatedScan,
    });

  } catch (error) {
    console.error("[scanMalpot] Error:", error);

    // Mark scan as failed if doc was created
    if (req.body?._scanId) {
      await ScanDocument.findByIdAndUpdate(req.body._scanId, { status: "Failed" }).catch(() => {});
    }

    return res.status(500).json({ error: error.message });

  } finally {
    // Clean up temp file from multer
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
};

// GET /api/scans — list all with pagination
export const getAllScans = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [scans, total] = await Promise.all([
      ScanDocument.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("relatedLand", "kittaNumber district"),
      ScanDocument.countDocuments(),
    ]);

    return res.json({
      data: scans,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/scans/:id
export const getScanById = async (req, res) => {
  try {
    const scan = await ScanDocument.findById(req.params.id).populate("relatedLand");
    if (!scan) return res.status(404).json({ message: "Scan not found." });
    return res.json({ data: scan });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};