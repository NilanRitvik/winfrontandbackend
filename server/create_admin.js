const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const createLegacyAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Legacy Admin Seed');

        const adminEmail = 'purusothhrm@gmail.com';
        const adminPassword = 'Win365Admin2026';
        const username = 'AdminUserLegacy';

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // CHECK USER COLLECTION (Old Logic)
        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            console.log('Legacy Admin User exists. Updating role...');
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            // existingUser.isAdmin = true; // Some old schemas might check this
            await existingUser.save();
            console.log('Legacy Admin User updated.');
        } else {
            const newUser = new User({
                username,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await newUser.save();
            console.log('Legacy Admin User created in USER collection.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

createLegacyAdmin();
