const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Admin Seed');

        const adminEmail = 'purusothhrm@gmail.com';
        const adminPassword = 'Win365Admin2026';
        const username = 'SuperAdmin';

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // CHECK ADMIN COLLECTION (Correct!)
        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin exists. Updating password...');
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('Admin password updated.');
        } else {
            const newAdmin = new Admin({
                username,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            console.log('Admin created in ADMIN collection.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

createAdmin();
