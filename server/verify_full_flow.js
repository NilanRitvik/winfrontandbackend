const mongoose = require('mongoose');

// Hardcoded URI to ensure we hit the same DB
const MONGO_URI = 'mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/roulette-db?retryWrites=true&w=majority';
process.env.MONGO_URI = MONGO_URI; // Force server.js to use this

const app = require('./server');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const validAdmin = {
    email: 'admin@win365.com',
    password: 'admin123'
};

const newUser = {
    username: 'test_player_' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'password123'
};

const runTest = async () => {
    console.log('--- STARTING SERVER VERIFICATION ---');

    let server; // Define server here for scope access

    try {
        // 0. SEED ADMIN TO DB DIRECTLY
        // Use a new connection for seeding to ensure isolation
        const seedConn = await mongoose.createConnection(MONGO_URI).asPromise();
        console.log('Connected to DB for Seeding...');

        const AdminModel = seedConn.model('Admin', Admin.schema); // Use schema from imported model

        await AdminModel.deleteOne({ email: validAdmin.email });
        const salt = await bcrypt.genSalt(10);
        const hashedIds = await bcrypt.hash(validAdmin.password, salt);

        const newAdmin = new AdminModel({
            username: 'VerifyAdmin',
            email: validAdmin.email,
            password: hashedIds,
            role: 'admin'
        });
        await newAdmin.save();
        console.log('✅ Admin Seeded Directly to DB');
        await seedConn.close(); // Close seeding connection

    } catch (err) {
        console.error("Seeding Error:", err);
    }

    // Start Server
    const PORT = 5003;
    server = app.listen(PORT, async () => {
        console.log(`Server running on ${PORT}`);
        const API_URL = `http://localhost:${PORT}/api/auth`;

        try {
            // 1. Test Admin Login
            console.log('\n[1] Testing Admin Login...');
            try {
                const adminRes = await fetch(`${API_URL}/admin-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validAdmin)
                });
                const adminData = await adminRes.json();

                if (adminRes.ok && adminData.token) {
                    console.log('✅ Admin Login SUCCESS');
                } else {
                    console.error('❌ Admin Login FAILED:', adminData);
                }
            } catch (e) { console.error("Fetch Error (Admin):", e.message); }

            // 2. Test User Registration
            console.log('\n[2] Testing User Registration...');
            try {
                const regRes = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });
                const regData = await regRes.json();

                if (regRes.status === 201) {
                    console.log('✅ Registration SUCCESS');
                } else {
                    console.error('❌ Registration FAILED:', regData);
                }
            } catch (e) { console.error("Fetch Error (Register):", e.message); }

            // 3. Test User Login
            console.log('\n[3] Testing User Login...');
            try {
                const loginRes = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newUser.email, password: newUser.password })
                });
                const loginData = await loginRes.json();

                if (loginRes.ok && loginData.token) {
                    console.log('✅ User Login SUCCESS');
                } else {
                    console.error('❌ User Login FAILED:', loginData);
                }
            } catch (e) { console.error("Fetch Error (User Login):", e.message); }

        } catch (error) {
            console.error('FATAL ERROR:', error);
        } finally {
            console.log('\n--- TEST COMPLETE ---');
            server.close();
            process.exit(0);
        }
    });
};

runTest();
