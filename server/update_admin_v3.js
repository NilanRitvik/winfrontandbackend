const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

// HARDCODED CONNECTION (Same as server)
const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const updateAdmin = async () => {
    await connectDB();

    try {
        // 1. CLEAR OLD LOGS (Drop Admin Collection mostly clears admin logs/users)
        // If there are other log collections, I would clear them here too.
        // For now, getting a fresh Admin user is the priority.
        await Admin.deleteMany({});
        console.log('Old Admin Records Cleared.');

        // 2. CREATE NEW ADMIN
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('$win365@2026ai$', salt);

        const newAdmin = new Admin({
            username: 'Admin',
            email: 'purusothhrm@gmail.com',
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();

        console.log('New Admin Created: purusothhrm@gmail.com');

    } catch (error) {
        console.error('Error updating admin:', error);
    } finally {
        mongoose.disconnect();
    }
};

updateAdmin();
