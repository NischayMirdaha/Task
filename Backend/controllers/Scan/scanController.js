import { extractTextFromImage } from "../../services/ocrService.js";
import { parseMalpotData } from "../../services/malpotParser.js";
import Land from "../../models/Land.js";

export const scanMalpot = async (req, res) => {
  try {
    const imagePath = req.file.path;

    // 1. Extract text
    const text = await extractTextFromImage(imagePath);

    // 2. Parse sections
    const data = parseMalpotData(text);

    // 3. Save to database
    const newLand = await Land.create(data);

    res.status(201).json({
      message: "Malpot data extracted and saved",
      data: newLand
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};