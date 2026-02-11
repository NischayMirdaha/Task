import OwnershipTransfer from "../../models/Ownership.js";
import Land from "../../models/Land.js";


// 🔹 Create Ownership Transfer Request
export const createTransfer = async (req, res) => {
  try {
    const { landId, newOwner } = req.body;

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    const transfer = await OwnershipTransfer.create({
      landId,
      previousOwner: {
        name: land.owner.name,
        citizenshipNo: land.owner.citizenshipNo
      },
      newOwner
    });

    res.status(201).json({
      message: "Ownership transfer request submitted",
      transfer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔹 Get All Transfers
export const getAllTransfers = async (req, res) => {
  try {
    const transfers = await OwnershipTransfer.find()
      .populate("landId");

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔹 Approve Transfer (Officer)
export const approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await OwnershipTransfer.findById(id);

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    const land = await Land.findById(transfer.landId);

    // Update Land Owner
    land.owner = transfer.newOwner;
    await land.save();

    transfer.status = "Approved";
    await transfer.save();

    res.json({ message: "Ownership transfer approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔹 Reject Transfer (Officer)
export const rejectTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transfer = await OwnershipTransfer.findById(id);

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    transfer.status = "Rejected";
    transfer.rejectionReason = reason;

    await transfer.save();

    res.json({ message: "Ownership transfer rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
