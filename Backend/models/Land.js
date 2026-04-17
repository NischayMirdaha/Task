// models/Land.js
import mongoose from "mongoose";

const landSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    citizenshipNumber: {
      type: String,
      required: true,
      trim: true,
    },
    kittaNumber: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      district: { type: String, required: true, trim: true },
      municipality: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    landType: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

landSchema.index({ ownerName: "text", citizenshipNumber: "text", kittaNumber: "text" });
landSchema.index({ kittaNumber: 1 }, { unique: true });

export default mongoose.model("Land", landSchema);
