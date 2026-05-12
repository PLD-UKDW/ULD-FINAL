import crypto from 'crypto';
import type { Request } from 'express';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads', 'berita');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        cb(null, name);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Hanya gambar dengan format .jpg, .jpeg, .png, atau .webp yang diperbolehkan!'));
    }
};

const maxSize = Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024; // default 5MB
const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

export default upload;
export { upload };
