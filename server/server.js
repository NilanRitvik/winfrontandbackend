const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS - Allow all origins explicitly
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Handle preflight requests
app.options('*', cors());

// app.use(helmet());

app.get('/api/test', (req, res) => res.json({ status: 'ok', msg: 'Server is working' }));

// Database Connection
const LOCAL_FALLBACK = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGO_URI || LOCAL_FALLBACK)
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
    res.json({ message: 'Roulette Prediction API - V2 LIVE', timestamp: new Date() });
});

// For Vercel/Serverless
module.exports = app;

// Only run server if called directly (dev mode)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
