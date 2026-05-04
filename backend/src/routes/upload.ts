import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middlewares/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = (req.query.folder as string) || 'misc';
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadPath = path.join(__dirname, '../../../database/uploads', safeFolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/', authenticate, upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  
  const folder = (req.query.folder as string) || 'misc';
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
  const fileUrl = `/uploads/${safeFolder}/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.originalname });
});

router.delete('/', authenticate, (req: Request, res: Response): void => {
  const fileUrl = req.query.url as string;
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    res.status(400).json({ message: 'Invalid URL' });
    return;
  }
  
  const safeUrl = path.normalize(fileUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, '../../../database', safeUrl);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file' });
  }
});

export default router;
