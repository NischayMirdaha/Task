import mongoose from "mongoose";

const parsedDataSchema = new mongoose.Schema(
  {
    ownerName: String,
    citizenshipNumber: String,
    kittaNumber: String,
    location: String,
    area: String,
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      enum: ["Lalpurja", "Citizenship"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    parsedData: {
      type: parsedDataSchema,
      default: {},
    },
    languageDetected: {
      type: String,
      enum: ["english", "nepali", "mixed", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ "parsedData.kittaNumber": 1 });
documentSchema.index({ "parsedData.citizenshipNumber": 1 });

export default mongoose.model("Document", documentSchema);
