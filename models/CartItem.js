import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
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

    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
}, 
{ 
    _id: false 
});

export default cartItemSchema;