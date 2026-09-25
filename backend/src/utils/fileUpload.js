import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800');
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || '').split(',').filter(Boolean);

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.length > 0 && !ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

export const processUploadedFile = async (file) => {
  const filePath = file.path;
  const mimeType = file.mimetype;
  let processedPath = filePath;
  let finalSize = file.size;
  let fileHash = null;

  // Calculate file hash for duplicate detection
  const hash = crypto.createHash('sha256');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  fileHash = hash.digest('hex');

  // Compress images
  if (mimeType.startsWith('image/')) {
    const compressedPath = filePath.replace(path.extname(filePath), '_compressed.webp');
    await sharp(fileBuffer)
      .webp({ quality: 80, effort: 4 })
      .toFile(compressedPath);
    
    fs.unlinkSync(filePath);
    processedPath = compressedPath;
    finalSize = fs.statSync(compressedPath).size;
  }

  return {
    originalName: file.originalname,
    storedName: path.basename(processedPath),
    path: processedPath,
    size: finalSize,
    mimeType,
    hash: fileHash
  };
};

export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};

export const getFileExtension = (mimeType) => {
  const extensions = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/zip': '.zip'
  };
  return extensions[mimeType] || '';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isAllowedFileType = (mimeType) => {
  return ALLOWED_TYPES.length === 0 || ALLOWED_TYPES.includes(mimeType);
};