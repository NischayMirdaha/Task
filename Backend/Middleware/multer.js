import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/malpot/");
  },
  filename: function (req, file, cb) {
    const kittaNumber = req.body.kittaNumber || "unknown";
    const uniqueName = `malpot_${kittaNumber}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });
