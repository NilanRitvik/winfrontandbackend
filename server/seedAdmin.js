const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roulette-prediction')
    .then(async () => {
        console.log('Connected DB for Seeding');
        const adminExists = await User.findOne({ username: 'admin123' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123', salt);
        await new User({
            username: 'admin123',
            email: 'admin@admin.com',
            password,
            role: 'admin'
        }).save();
        console.log('Admin created: admin123 / 123');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
