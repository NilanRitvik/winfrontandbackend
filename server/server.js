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
app.use(cors());
app.use(helmet());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roulette-prediction')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

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
    res.send('Roulette Prediction API');
});

// For Vercel/Serverless
module.exports = app;

// Only run server if called directly (dev mode)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
