import mongoose from "mongoose";
import OwnershipTransfer from "../../models/OwnershipTrasfer.js";
import Land from "../../models/Land.js";


// ================= APPLY =================
export const applyTransfer = async (req, res) => {
  try {
    const { landId, previousOwner, newOwner } = req.body;

    const land = await Land.findById(landId);
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    /* 🔐 EXTRA SAFETY */
    if (land.isTransferLocked) {
      return res.status(400).json({
        message: "Transfer already in progress for this land"
      });
    }

    if (land.owner.citizenshipNo !== previousOwner.citizenshipNo) {
      return res.status(400).json({
        message: "Previous owner does not match land record"
      });
    }

    const documents = {
      citizenship: req.files?.citizenship?.[0]?.path,
      saleDeed: req.files?.saleDeed?.[0]?.path,
      taxClearance: req.files?.taxClearance?.[0]?.path
    };

    if (!documents.citizenship || !documents.saleDeed || !documents.taxClearance) {
      return res.status(400).json({ message: "All documents are required" });
    }

    const transfer = await OwnershipTransfer.create({
      landId,
      previousOwner,
      newOwner,
      documents
    });

    /* 🔐 Lock land */
    land.isTransferLocked = true;
    await land.save();

    res.status(201).json({
      success: true,
      message: "Ownership transfer request submitted",
      transfer
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= APPROVE =================
export const approveTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await OwnershipTransfer.findById(req.params.id).session(session);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    if (transfer.status !== "Pending") {
      return res.status(400).json({ message: "Transfer already processed" });
    }

    const land = await Land.findById(transfer.landId).session(session);
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    /* APPROVE */
    transfer.status = "Approved";
    transfer.verifiedBy = req.user.id;
    transfer.verifiedAt = new Date();
    await transfer.save({ session });

    land.owner = transfer.newOwner;
    land.transferHistory.push(transfer._id);
    land.isTransferLocked = false;
    await land.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Ownership transferred successfully"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};


// ================= REJECT =================
export const rejectTransfer = async (req, res) => {
  try {
    const { reason } = req.body;

    const transfer = await OwnershipTransfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    transfer.status = "Rejected";
    transfer.rejectionReason = reason;
    transfer.verifiedBy = req.user.id;
    transfer.verifiedAt = new Date();
    await transfer.save();

    await Land.findByIdAndUpdate(transfer.landId, {
      isTransferLocked: false
    });

    res.json({ success: true, message: "Transfer rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= HISTORY =================
export const getTransferHistory = async (req, res) => {
  const history = await OwnershipTransfer.find({
    landId: req.params.landId
  })
    .populate("verifiedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(history);
};
