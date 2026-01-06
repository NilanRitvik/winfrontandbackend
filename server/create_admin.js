const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path as needed
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seed Script');

        const email = 'purusothhrm@gmail.com';
        const password = '$win365@2026ai$';
        const username = 'AdminUser';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists. Updating to Admin Role and resetting password...');
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.isAdmin = true;
            await existingUser.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new Admin user...');
            const newAdmin = new User({
                username,
                email,
                password: hashedPassword,
                role: 'admin',
                isAdmin: true
            });
            await newAdmin.save();
            console.log('Admin user created successfully.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin:', error);
        mongoose.disconnect();
    }
};

createAdmin();
