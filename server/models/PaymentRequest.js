const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: String, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Crypto'], default: 'UPI' },
    cryptoCoin: { type: String },
    cryptoAmount: { type: String },
    utr: { type: String, required: true, unique: true }, // Stores UTR or Transaction Hash
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
