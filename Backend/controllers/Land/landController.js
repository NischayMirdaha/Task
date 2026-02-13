import Land from "../../models/Land.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const registerLand = async (req, res) => {
  try {
    const {
      kittaNumber,
      area,
      areaUnit,
      district,
      ward,
      landType,
      ownerName,
      citizenshipNo
    } = req.body;

    // Validate fields
    if (
      !kittaNumber ||
      !area ||
      !areaUnit ||
      !district ||
      !ward ||
      !landType ||
      !ownerName ||
      !citizenshipNo
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate kitta
    const existingLand = await Land.findOne({ kittaNumber });
    if (existingLand) {
      return res.status(400).json({
        message: "Land with this kitta number already exists"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Ownership document required"
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "malpot/land-documents",
      resource_type: "auto"
    });

    // Delete local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const land = await Land.create({
      kittaNumber,
      area: Number(area),
      areaUnit,
      district,
      ward: Number(ward),
      landType,
      owner: {
        name: ownerName,
        citizenshipNo
      },
      ownershipDocument: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url
      },
      createdBy: req.user.id,
      status: "Active"
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
