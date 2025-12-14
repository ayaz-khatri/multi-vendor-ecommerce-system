import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'stripe', 'cod'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },

    refundForPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },

    currency: {
        type: String,
        default: 'USD'
    }
}, 
{ 
    timestamps: true 
});


const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
