import multer from 'multer';
import path from 'path';
import fs from 'fs';

// use maxSize in bytes (e.g., 5 * 1024 * 1024 for 5MB) in options object like: { maxSize: 5 * 1024 * 1024 }
// use allowedMimeTypes in options object like: { allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }

const createUploader = (folder = '', options = {}) => {

    const uploadDir = path.join('./public/uploads', folder);

    // Ensure folder exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = Date.now() + ext;
            cb(null, filename);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedMimeTypes = options.allowedMimeTypes || ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    };

    return multer({
        storage,
        limits: { fileSize: options.maxSize || 5 * 1024 * 1024 }, // default 5MB
        fileFilter
    });
};

export default createUploader;
