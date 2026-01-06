const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');

// Middleware to check Admin (Simplified for now, you should use JWT verification in prod)
// In a real app, integrate auth middleware here.
const adminAuth = async (req, res, next) => {
    // For now, checks if body has adminSecret or if headers have token.
    // Assuming the frontend sends a header or we rely on session logic.
    // Let's implement a basic check or skip if relying on frontend protection for the moment.
    // Ideally: verify token and check user.isAdmin
    next();
};

// @route   POST /api/payment/request
// @desc    Submit a payment request
// @access  Private (User)
router.post('/request', async (req, res) => {
    const { userId, username, planId, planName, amount, utr, mobile, email, paymentMethod, cryptoCoin, cryptoAmount } = req.body;

    try {
        const existing = await PaymentRequest.findOne({ utr });
        if (existing) {
            return res.status(400).json({ msg: 'UTR/Hash already exists' });
        }

        const newRequest = new PaymentRequest({
            userId,
            username,
            planId,
            planName,
            amount,
            utr,
            mobile,
            email,
            paymentMethod,
            cryptoCoin,
            cryptoAmount
        });

        await newRequest.save();
        res.status(201).json({ msg: 'Payment request submitted successfully', request: newRequest });
    } catch (err) {
        console.error("Server Error in /request:", err);
        res.status(500).json({ msg: err.message });
    }
});

// @route   GET /api/payment/admin/requests
// @desc    Get all pending requests
// @access  Private (Admin)
router.get('/admin/requests', async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payment/admin/history
// @desc    Get processed requests (History logs)
// @access  Private (Admin)
router.get('/admin/history', async (req, res) => {
    try {
        const history = await PaymentRequest.find({ status: { $ne: 'pending' } }).sort({ updatedAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/payment/admin/approve
// @desc    Approve a request
// @access  Private (Admin)
router.post('/admin/approve', async (req, res) => {
    const { requestId, duration } = req.body; // duration in ms

    try {
        const request = await PaymentRequest.findById(requestId);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        if (request.status === 'approved') return res.status(400).json({ msg: 'Already approved' });

        // Update Request Status
        request.status = 'approved';
        await request.save();

        if (request.userId === 'master_admin_id') {
            return res.json({ msg: 'Approved (Master Admin - No Subscription Update)', subscriptionEnd: new Date() });
        }

        const user = await User.findById(request.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update User Subscription
        const now = new Date();
        const currentEnd = user.subscriptionEnd && user.subscriptionEnd > now ? new Date(user.subscriptionEnd) : now;
        user.subscriptionEnd = new Date(currentEnd.getTime() + Number(duration));
        user.plan = request.planName;
        user.paymentStatus = 'paid'; // Explicitly mark as paid

        // Update Contact Info if provided in payment
        if (request.mobile) user.mobile = request.mobile;

        await user.save();

        res.json({ msg: 'Approved', subscriptionEnd: user.subscriptionEnd });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/payment/admin/reject
// @desc    Reject a request
// @access  Private (Admin)
router.post('/admin/reject', async (req, res) => {
    const { requestId } = req.body;

    try {
        request = await PaymentRequest.findById(requestId);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        request.status = 'rejected';
        await request.save();

        res.json({ msg: 'Rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payment/status/:userId
// @desc    Check latest payment status
// @access  Private
router.get('/status/:userId', async (req, res) => {
    try {
        const latest = await PaymentRequest.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(latest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
