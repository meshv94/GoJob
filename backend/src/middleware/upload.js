import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

// Recreate __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure folders exist
const baseDir = path.join(__dirname, '../../Uploads');
['images', 'pdf', 'csv'].forEach(sub => {
  const dir = path.join(baseDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    file.folder = 'images';
    cb(null, true);
  } else if (ext === '.pdf') {
    file.folder = 'pdf';
    cb(null, true);
  } else if (ext === '.csv') {
    file.folder = 'csv';
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, jpeg, png), PDF, and CSV files are allowed'));
  }
};

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(baseDir, file.folder || 'misc'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = unique + '-' + file.originalname;
    file.relativePath = `${file.folder}/${filename}`; // <-- Add relative path for controller
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

export default upload;