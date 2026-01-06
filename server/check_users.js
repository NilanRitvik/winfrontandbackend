const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority";

const checkUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB. Fetching users...');
        const users = await User.find({});
        console.log('--- USERS LIST ---');
        users.forEach(u => {
            console.log(`Email: '${u.email}', Role: ${u.role}, Username: '${u.username}'`);
        });
        console.log('------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
