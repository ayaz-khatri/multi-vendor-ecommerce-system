import mongoose from 'mongoose';
import orderItemSchema from './OrderItem.js';

const orderSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: {
        type: [orderItemSchema],
        default: []
    },

    totalQuantity: {
        type: Number,
        required: true,
        min: 1
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    
    shippingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
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

    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, 
{
    timestamps: true
});

orderSchema.pre('save', function(next) {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

orderSchema.index({ userId: 1 });
orderSchema.index({ 'items.vendorId': 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
