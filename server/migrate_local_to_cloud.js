const mongoose = require('mongoose');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const PaymentRequest = require('./models/PaymentRequest');
const AdminAI = require('./models/AdminAI'); // If exists? list showed it.

const LOCAL_URI = 'mongodb://127.0.0.1:27017/roulette-prediction';
const CLOUD_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';

const migrate = async () => {
    try {
        console.log("--- STARTING MIGRATION ---");

        // 1. READ FROM LOCAL
        console.log(`1. Connecting to LOCAL DB: ${LOCAL_URI}`);
        await mongoose.connect(LOCAL_URI);

        const localUsers = await User.find({}).lean();
        const localTickets = await Ticket.find({}).lean();
        const localPayments = await PaymentRequest.find({}).lean();
        // Check if AdminAI model works (it might be new)
        let localAI = [];
        try {
            localAI = await AdminAI.find({}).lean();
        } catch (e) {
            console.log("Skipping AdminAI (maybe empty or schema issue)");
        }

        console.log(`   DATA FETCHED:`);
        console.log(`   - Users: ${localUsers.length}`);
        console.log(`   - Tickets: ${localTickets.length}`);
        console.log(`   - Payments: ${localPayments.length}`);
        console.log(`   - AI Configs: ${localAI.length}`);

        await mongoose.disconnect();
        console.log("   Disconnected from Local.");

        // 2. WRITE TO CLOUD
        console.log(`2. Connecting to CLOUD DB...`);
        await mongoose.connect(CLOUD_URI);
        console.log("   Connected to Cloud.");

        // Helpers
        const upsertData = async (Model, data, keyField = '_id') => {
            if (data.length === 0) return;
            console.log(`   Migrating ${Model.modelName}...`);
            let count = 0;
            for (const item of data) {
                const filter = { [keyField]: item[keyField] };
                // Using replaceOne to ensure local version overwrite cloud version exactly
                await Model.replaceOne(filter, item, { upsert: true });
                count++;
            }
            console.log(`   > Synced ${count} documents for ${Model.modelName}`);
        };

        await upsertData(User, localUsers);
        await upsertData(Ticket, localTickets);
        await upsertData(PaymentRequest, localPayments);
        if (localAI.length > 0) await upsertData(AdminAI, localAI);

        console.log("--- MIGRATION COMPLETE ---");
        process.exit(0);
    } catch (err) {
        console.error("MIGRATION FAILED:", err);
        process.exit(1);
    }
};

migrate();
