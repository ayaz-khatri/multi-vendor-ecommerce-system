import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    commission: {
        type: Number,
        required: true,
        min: 0
    },

    payoutAmount: {
        type: Number,
        required: true
    },

    payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'paypal'],
        required: true
    },

    payoutStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
    },

    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },

    currency: {
        type: String,
        default: 'USD'
    }
},
{ 
    timestamps: true 
});

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;