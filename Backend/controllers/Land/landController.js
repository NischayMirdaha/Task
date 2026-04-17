import Land from "../../models/Land.js";

const buildLandFilter = (query) => {
  const filter = {};

  if (query.ownerName) {
    filter.ownerName = { $regex: query.ownerName, $options: "i" };
  }

  if (query.kittaNumber) {
    filter.kittaNumber = { $regex: query.kittaNumber, $options: "i" };
  }

  if (query.citizenshipNumber) {
    filter.citizenshipNumber = {
      $regex: query.citizenshipNumber,
      $options: "i",
    };
  }

  return filter;
};

export const createLand = async (req, res) => {
  try {
    const land = await Land.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Land record created successfully.",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create land record.",
      error: error.message,
    });
  }
};

export const getLands = async (req, res) => {
  try {
    const lands = await Land.find(buildLandFilter(req.query)).populate(
      "createdBy",
      "username email role"
    );

    return res.status(200).json({
      success: true,
      count: lands.length,
      lands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch land records.",
      error: error.message,
    });
  }
};

export const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate(
      "createdBy",
      "username email role"
    );

    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      land,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch land record.",
      error: error.message,
    });
  }
};

export const updateLand = async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Land record updated successfully.",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update land record.",
      error: error.message,
    });
  }
};

export const deleteLand = async (req, res) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Land record deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete land record.",
      error: error.message,
    });
  }
};

export const getLandTax = async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    const taxRateMap = {
      residential: 15,
      commercial: 30,
      agricultural: 10,
      industrial: 40,
    };

    const rate = taxRateMap[land.landType.toLowerCase()] || 12;
    const taxAmount = land.area * rate;

    return res.status(200).json({
      success: true,
      landId: land._id,
      area: land.area,
      landType: land.landType,
      rate,
      taxAmount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate land tax.",
      error: error.message,
    });
  }
};
