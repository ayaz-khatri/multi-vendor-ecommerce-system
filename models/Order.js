import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    orderNumber: 
    { 
        type: String, 
        unique: true,
        required: true
    },

    totalQuantity: {
        type: Number,
        required: true,
        min: 0
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },

    paymentMethod: {
        type: String,
        enum: ['cod', 'card', 'paypal', 'stripe'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    overallStatus: {
        type: String,
        enum: ['pending', 'partially_completed', 'completed', 'cancelled'],
        default: 'pending'
    },

    shippingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },


}, { timestamps: true });

orderSchema.index({ userId: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
