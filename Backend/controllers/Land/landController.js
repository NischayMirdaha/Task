import Land from "../../models/Land.js";
import cloudinary from "../config/cloudinary.js";

export const registerLand = async (req, res) => {
  try {
    const {
      kittaNumber,
      area,
      areaUnit,
      district,
      ward,
      landType
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Ownership document required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "malpot/land-documents",
      resource_type: "auto"
    });

    const land = await Land.create({
      kittaNumber,
      area,
      areaUnit,
      district,
      ward,
      landType,
      ownershipDocument: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url
      },
      createdBy: req.user.id // from auth middleware
    });

    res.status(201).json({
      success: true,
      message: "Land registered successfully",
      land
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
