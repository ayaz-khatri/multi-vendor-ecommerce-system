import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_FOLDER = process.env.APP_NAME?.replace(/\s+/g, '-').toLowerCase() || 'default-project';

export const uploadImage = async (file, folder = 'uploads') => {
    if (!file) return null;

    // Full folder path: project-name/folder
    const fullFolder = `${PROJECT_FOLDER}/${folder}`;

    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: fullFolder }
    );

    return {
        url: result.secure_url,
        publicId: result.public_id
    };
};

export const destroyImage = async (publicId) => {
    if (!publicId) return null;

    return cloudinary.uploader.destroy(publicId);
};
