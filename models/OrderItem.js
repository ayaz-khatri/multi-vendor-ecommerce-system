import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
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

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    }
}, 
{ 
    _id: false 
});

export default orderItemSchema;