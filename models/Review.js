import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        trim: true
    },

    vendorReply: { 
        type: String, 
        trim: true 
    },

    helpfulCount: 
    { 
        type: Number, 
        default: 0 
    },

    isApproved: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },
},
{
    timestamps: true
});

// One review per user per product
reviewSchema.index(
    { userId: 1, productId: 1 },
    { unique: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
