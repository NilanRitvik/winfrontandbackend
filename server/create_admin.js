const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seed Script');

        const adminEmail = 'purusothhrm@gmail.com';
        const adminPassword = 'Win365Admin2026';
        const username = 'AdminUser';

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // CHECK ADMIN COLLECTION
        const existingUser = await Admin.findOne({ email: adminEmail });

        if (existingUser) {
            console.log('Admin already exists. Resetting password...');
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log('Admin password reset successfully.');
        } else {
            const newAdmin = new Admin({
                username,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            console.log('New Admin created in ADMIN collection successfully.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

createAdmin();
