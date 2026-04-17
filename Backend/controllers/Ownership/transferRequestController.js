import fs from "fs";
import cloudinary from "../../config/cloudinary.js";
import Land from "../../models/Land.js";
import TransferRequest from "../../models/TransferRequest.js";

const uploadTransferFile = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "mirdaha/transfers",
    resource_type: "auto",
  });

  return result.secure_url;
};

const cleanupFiles = (files = []) => {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

export const createTransferRequest = async (req, res) => {
  try {
    const { landId, newOwnerName, newCitizenshipNumber } = req.body;
    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    const documentUrls = [];
    for (const file of req.files || []) {
      documentUrls.push(await uploadTransferFile(file.path));
    }

    const transferRequest = await TransferRequest.create({
      landId,
      requestedBy: req.user._id,
      currentOwnerName: land.ownerName,
      newOwnerName,
      newCitizenshipNumber,
      documentUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Transfer request submitted successfully.",
      transferRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit transfer request.",
      error: error.message,
    });
  } finally {
    cleanupFiles(req.files || []);
  }
};

export const getTransferRequests = async (req, res) => {
  try {
    const filter = req.user.role === "user" ? { requestedBy: req.user._id } : {};

    const transferRequests = await TransferRequest.find(filter)
      .populate("landId")
      .populate("requestedBy", "username email role")
      .populate("reviewedBy", "username email role");

    return res.status(200).json({
      success: true,
      count: transferRequests.length,
      transferRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer requests.",
      error: error.message,
    });
  }
};

export const reviewTransferRequest = async (req, res) => {
  try {
    const { status, officerRemarks } = req.body;
    const transferRequest = await TransferRequest.findById(req.params.id);

    if (!transferRequest) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found.",
      });
    }

    transferRequest.status = status;
    transferRequest.officerRemarks = officerRemarks || "";
    transferRequest.reviewedBy = req.user._id;
    await transferRequest.save();

    if (status === "approved") {
      await Land.findByIdAndUpdate(transferRequest.landId, {
        ownerName: transferRequest.newOwnerName,
        citizenshipNumber: transferRequest.newCitizenshipNumber,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Transfer request ${status}.`,
      transferRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to review transfer request.",
      error: error.message,
    });
  }
};
