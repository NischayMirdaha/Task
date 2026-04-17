import mongoose from "mongoose";

const transferRequestSchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentOwnerName: {
      type: String,
      required: true,
    },
    newOwnerName: {
      type: String,
      required: true,
    },
    newCitizenshipNumber: {
      type: String,
      required: true,
    },
    documentUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    officerRemarks: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

transferRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("TransferRequest", transferRequestSchema);
