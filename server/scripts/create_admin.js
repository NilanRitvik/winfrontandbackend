const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' }); // Adjust path if running from server dir

const createAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roulette-prediction';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected...');

        const email = 'admin@gmail.com';
        const passwordPlain = 'rZ335|S7y0B_';

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        // Upsert Admin User
        const adminUser = await User.findOneAndUpdate(
            { email },
            {
                username: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'admin',
                subscriptionEnd: new Date(2099, 11, 31) // Lifetime
            },
            { upsert: true, new: true }
        );

        console.log('Admin User Created/Updated:', adminUser.email);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
