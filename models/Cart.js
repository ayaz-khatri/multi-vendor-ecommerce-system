import mongoose from 'mongoose';
import cartItemSchema from './CartItem.js';

const cartSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // One cart per user
    },

    items: {
        type: [cartItemSchema],
        default: []
    },

    totalQuantity: {
        type: Number,
        default: 0,
        min: 0
    },

    totalPrice: {
        type: Number,
        default: 0,
        min: 0
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

cartSchema.pre('save', function() {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
});

cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
