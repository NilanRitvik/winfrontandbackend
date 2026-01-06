const mongoose = require('mongoose');
const User = require('../models/User');
const PaymentRequest = require('../models/PaymentRequest');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Adjust path if needed

const migrateUserContacts = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roulette-prediction';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // Find the most recent approved payment request for this user to get mobile number
            const latestPayment = await PaymentRequest.findOne({
                userId: user._id.toString(),
                status: 'approved'
            }).sort({ createdAt: -1 });

            if (latestPayment && latestPayment.mobile) {
                user.mobile = latestPayment.mobile;
                await user.save();
                console.log(`Updated mobile for user ${user.username}: ${user.mobile}`);
            } else {
                // If no approved payment, maybe check pending? or leave null
                const pendingPayment = await PaymentRequest.findOne({
                    userId: user._id.toString()
                }).sort({ createdAt: -1 });

                if (pendingPayment && pendingPayment.mobile) {
                    user.mobile = pendingPayment.mobile;
                    await user.save();
                    console.log(`Updated mobile for user ${user.username} from pending/other req: ${user.mobile}`);
                } else {
                    console.log(`No mobile number found for user ${user.username}`);
                }
            }
        }

        console.log('Migration complete.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateUserContacts();
