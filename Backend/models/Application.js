import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  applicationType: {
    type: String,
    enum: ["NewRegistration", "OwnershipTransfer", "RecordCorrection"],
    required: true
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
    // Land ID / Transfer ID / Correction ID
  },

  documents: {
    type: Object // file URLs
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "ResubmissionRequired"],
    default: "Pending"
  },

  officerComment: String,

  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  actionDate: Date

}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
