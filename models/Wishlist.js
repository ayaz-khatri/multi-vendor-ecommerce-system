import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // One wishlist per user
    },

    items: [
        {
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
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

// Optional: ensure no duplicate products in wishlist
wishlistSchema.index(
    { userId: 1, "items.productId": 1 },
    { unique: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
