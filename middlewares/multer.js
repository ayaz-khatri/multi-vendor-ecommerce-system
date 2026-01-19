import multer from 'multer';

// use maxSize in bytes (e.g., 5 * 1024 * 1024 for 5MB) in options object like: { maxSize: 5 * 1024 * 1024 }
// use allowedMimeTypes in options object like: { allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }

const createUploader = (options = {}) => {

    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        const allowedMimeTypes = options.allowedMimeTypes || [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    };

    return multer({
        storage,
        limits: { fileSize: options.maxSize || 5 * 1024 * 1024 },
        fileFilter
    });
};

export default createUploader;

