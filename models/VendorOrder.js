 import mongoose from 'mongoose';
 
 const vendorOrderSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
            default: 'pending'
        }
    }],

    subtotal: 
    { 
        type: Number,
        required: true,
        min: 0
    },

    vendorStatus: {
        type: String,
        enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    commission: 
    { 
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    
    vendorEarning: 
    {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }

}, { timestamps: true });

vendorOrderSchema.index({ vendorId: 1 });
vendorOrderSchema.index({ orderId: 1 });

vendorOrderSchema.pre('save', function() {
    if (this.items && this.items.length) {
        this.items.forEach(item => {
            // Only calculate if subtotal not already set
            if (!item.subtotal) item.subtotal = item.price * item.quantity;
        });
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    } else {
        this.subtotal = 0;
    }
});


const VendorOrder = mongoose.model('VendorOrder', vendorOrderSchema);
export default VendorOrder;