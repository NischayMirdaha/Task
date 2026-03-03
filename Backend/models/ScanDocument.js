import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  text: String,
  confidence: Number
}, { _id: false });

const scanDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      enum: ["image", "pdf", "docx"],
      required: true
    },

    extractedText: {
      type: String
    },

    words: [wordSchema], // each detected word

    parsedData: {
      kittaNumber: String,
      district: String,
      ward: String,
      area: Number,
      ownerName: String,
      citizenshipNo: String
    },

    confidenceScore: {
      type: Number // overall OCR confidence
    },

    status: {
      type: String,
      enum: ["Processing", "Completed", "Failed"],
      default: "Processing"
    },

    relatedLand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land"
    }
  },
  { timestamps: true }
);

const ScanDocument = mongoose.model("ScanDocument", scanDocumentSchema);

export default ScanDocument;