import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (file, folder = 'uploads') => {
    if (!file) return null;

    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder }
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
