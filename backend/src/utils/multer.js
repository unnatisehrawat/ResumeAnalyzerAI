import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// File filter (PDF only)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === "application/pdf" || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are supported for resume analysis."), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
