const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists (username or email)
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                subscriptionEnd: user.subscriptionEnd
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // DB Check in Dedicated ADMIN Collection
        const user = await Admin.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials (Admin Not Found)' });

        // Verify Hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials (Password)' });

        const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });

        res.json({ token, user: { id: user._id, username: user.username, role: 'admin' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Current User (Refresh)
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');



        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

// Get All Users (Admin Only)
router.get('/users', async (req, res) => {
    try {
        // ideally add adminAuth middleware here
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
