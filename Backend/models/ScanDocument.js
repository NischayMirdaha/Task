import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  { text: String, confidence: Number, bbox: mongoose.Schema.Types.Mixed },
  { _id: false }
);

const lineSchema = new mongoose.Schema(
  { text: String, confidence: Number },
  { _id: false }
);

const scanDocumentSchema = new mongoose.Schema(
  {
    fileName:  { type: String, required: true },
    fileUrl:   { type: String, required: true },
    fileType:  { type: String, enum: ["image", "pdf", "docx"], required: true },

    // How it was captured
    sourceType: {
      type: String,
      enum: ["scanner", "fax", "photo", "auto"],
      default: "auto",
    },

    // Raw OCR output
    extractedText:  { type: String },
    words:          [wordSchema],
    ocrLines:       [lineSchema],
    confidenceScore: { type: Number },

    // Parsed structured fields (schema matches your ScanDocument model)
    parsedData: {
      kittaNumber:   String,
      district:      String,
      ward:          String,
      area:          Number,
      ownerName:     String,
      citizenshipNo: String,
    },

    // Signature detection
    hasSignature:     { type: Boolean, default: false },
    signatureUrl:     { type: String },              // Cloudinary URL of cropped signature
    signatureBounds:  { type: mongoose.Schema.Types.Mixed }, // {top, left, width, height}
    signatureDensity: { type: Number },              // % dark pixels — signature confidence

    // Processing state
    status: {
      type: String,
      enum: ["Processing", "Completed", "Failed"],
      default: "Processing",
    },
    parseErrors: [{ type: String }],

    // Relations
    relatedLand:  { type: mongoose.Schema.Types.ObjectId, ref: "Land" },
    ownershipRef: { type: mongoose.Schema.Types.ObjectId, ref: "Ownership" },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

scanDocumentSchema.index({ status: 1, createdAt: -1 });
scanDocumentSchema.index({ "parsedData.kittaNumber": 1, "parsedData.district": 1 });

export default mongoose.model("ScanDocument", scanDocumentSchema);