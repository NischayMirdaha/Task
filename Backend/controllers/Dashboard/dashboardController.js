import Document from "../../models/Document.js";
import Land from "../../models/Land.js";
import TransferRequest from "../../models/TransferRequest.js";

const taxRateMap = {
  residential: 15,
  commercial: 30,
  agricultural: 10,
  industrial: 40,
};

const calculateTax = (land) => {
  const rate = taxRateMap[land.landType?.toLowerCase()] || 12;
  return land.area * rate;
};

export const getDashboardSummary = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const lands = await Land.find();
      const totalTax = lands.reduce((sum, land) => sum + calculateTax(land), 0);

      return res.status(200).json({
        success: true,
        role: "admin",
        data: {
          totalLands: lands.length,
          totalTax,
        },
      });
    }

    if (req.user.role === "officer") {
      const pendingDocuments = await Document.countDocuments({ status: "pending" });
      const pendingTransfers = await TransferRequest.countDocuments({ status: "pending" });

      return res.status(200).json({
        success: true,
        role: "officer",
        data: {
          pendingDocuments,
          pendingTransfers,
        },
      });
    }

    const ownedLands = await Land.find({ createdBy: req.user._id });

    return res.status(200).json({
      success: true,
      role: "user",
      data: {
        ownedLands: ownedLands.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary.",
      error: error.message,
    });
  }
};
