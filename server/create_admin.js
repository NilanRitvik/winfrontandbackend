const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const createFreshAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Cloud DB');

        // NEW SIMPLE CREDENTIALS
        const adminEmail = 'admin@win365.com';
        const adminPassword = 'admin123';
        const username = 'MainAdmin';

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Delete any existing admin with this email first
        await Admin.deleteOne({ email: adminEmail });
        console.log('Cleared old admin if any...');

        // Create fresh admin
        const newAdmin = new Admin({
            username,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        console.log('=================================');
        console.log('NEW ADMIN CREATED SUCCESSFULLY!');
        console.log('Email: admin@win365.com');
        console.log('Password: admin123');
        console.log('=================================');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        mongoose.connection.close();
    }
};

createFreshAdmin();
