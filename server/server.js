const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet'); // Optional security

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Standard CORS for Render
// Should ideally restrict origin in production, but '*' is safe for initial debugging
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// app.use(helmet()); 

// Database Connection
// Use Environment Variable first, fallback to user-provided global URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://adminUser:RNCBOb1FbStSGw1u@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

// Routes
const authRoute = require('./routes/auth');
const paymentRoute = require('./routes/payment');
const ticketRoute = require('./routes/tickets');
const adminAIRoute = require('./routes/adminAI');

app.use('/api/auth', authRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/admin-ai', adminAIRoute);

app.get('/', (req, res) => {
    res.json({ message: 'Roulette Prediction API - Render Live', timestamp: new Date() });
});

// Start Server (Unconditional for Render)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
