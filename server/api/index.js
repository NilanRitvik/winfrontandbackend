const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// MANUAL CORS - Set headers on EVERY request
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// app.use(helmet());

// Database Connection (Hardcoded Fallback)
const LOCAL_FALLBACK = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

// Use a global variable to cache the connection in Serverless environment
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI || LOCAL_FALLBACK);
        isConnected = true;
        console.log('MongoDB Connected Successfully (Serverless)');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};

// Ensure DB connects on every request
app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// Routes
// We need to require routes relative to api/ directory or just move logic here?
// Ideally require('../routes/...') works in Vercel.
const authRoute = require('../routes/auth');
const paymentRoute = require('../routes/payment');
const ticketRoute = require('../routes/tickets');
const adminAIRoute = require('../routes/adminAI');

app.use('/api/auth', authRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/admin-ai', adminAIRoute);

app.get('/', (req, res) => {
    res.json({ message: 'Roulette Prediction API - V2 SERVERLESS LIVE', timestamp: new Date() });
});

app.get('/api/test', (req, res) => res.json({ status: 'ok', msg: 'Serverless working' }));

module.exports = app;
