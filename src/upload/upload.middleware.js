import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const ALLOWED_MIME_TYPES = new Set(["text/plain", "application/pdf"]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt"]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, .txt files are allowed."),
      false,
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
