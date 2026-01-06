const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Admin = require('./models/Admin');

// verified URI
const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const resetCredentials = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB for Password Reset...');

        const salt = await bcrypt.genSalt(10);

        // 1. Fix User: purusothhrm@gmail.com
        const userPass = await bcrypt.hash('Win365Admin2026', salt);
        await User.findOneAndUpdate(
            { email: 'purusothhrm@gmail.com' },
            {
                $set: {
                    password: userPass,
                    role: 'user', // Ensure role is user for the main login portal
                    username: 'PurusothUser'
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ User "purusothhrm@gmail.com" password reset to "Win365Admin2026"');

        // 2. Fix Admin: admin@win365.com
        const adminPass = await bcrypt.hash('admin123', salt);
        await Admin.findOneAndUpdate(
            { email: 'admin@win365.com' },
            {
                $set: {
                    password: adminPass,
                    role: 'admin',
                    username: 'MainAdmin'
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ Admin "admin@win365.com" password reset to "admin123"');

        console.log('--- CREDENTIALS FIXED ---');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error resetting passwords:', err);
    }
};

resetCredentials();
