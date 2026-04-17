import fs from "fs";
import cloudinary from "../../config/cloudinary.js";
import Document from "../../models/Document.js";
import { extractTextFromImage } from "../../services/ocrService.js";
import { parseMalpotData } from "../../services/malpotParser.js";

const uploadFileToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "mirdaha/documents",
    resource_type: "auto",
  });

  return result.secure_url;
};

const removeLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const uploadAndExtractDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Document file is required.",
    });
  }

  try {
    const { documentType = "Lalpurja" } = req.body;
    const fileUrl = await uploadFileToCloudinary(req.file.path);
    const extractedText = await extractTextFromImage(req.file.path);
    const parsedData = parseMalpotData(extractedText);

    const document = await Document.create({
      userId: req.user._id,
      documentType,
      fileUrl,
      extractedText,
      parsedData: {
        ownerName: parsedData.ownerName,
        citizenshipNumber: parsedData.citizenshipNumber,
        kittaNumber: parsedData.kittaNumber,
        location: parsedData.location,
        area: parsedData.area,
      },
      languageDetected: parsedData.languageDetected,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and OCR completed.",
      document,
      extractedText,
      parsedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process the document.",
      error: error.message,
    });
  } finally {
    removeLocalFile(req.file.path);
  }
};

export const getDocuments = async (req, res) => {
  try {
    const filter = req.user.role === "user" ? { userId: req.user._id } : {};
    const documents = await Document.find(filter).populate(
      "userId",
      "username email role"
    );

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents.",
      error: error.message,
    });
  }
};

export const updateDocumentStatus = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document status updated.",
      document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update document status.",
      error: error.message,
    });
  }
};
