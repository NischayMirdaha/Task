import mongoose from "mongoose";

const ownershipSchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true
    },

    owner: {
      name: {
        type: String,
        required: true
      },
      citizenshipNo: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },

    ownershipType: {
      type: String,
      enum: ["Single", "Joint"],
      default: "Single"
    },

    ownershipPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    isActive: {
      type: Boolean,
      default: true
    },

    transferredFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ownership",
      default: null
    }
  },
  { timestamps: true }
);

const Ownership = mongoose.model("Ownership", ownershipSchema);

export default Ownership;
