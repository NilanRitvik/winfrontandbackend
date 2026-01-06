const BASE_URL = 'https://win365v0-1.vercel.app/api';

const adminCreds = {
    email: 'admin@win365.com',
    password: 'admin123'
};

const verifyProd = async () => {
    console.log(`Checking LIVE API: ${BASE_URL}`);

    // Helper to print response
    const handleResponse = async (label, res) => {
        const contentType = res.headers.get('content-type');
        console.log(`\n[${label}] Status: ${res.status} ${res.statusText}`);

        if (contentType && contentType.includes('application/json')) {
            try {
                const data = await res.json();
                console.log(`   JSON: ${JSON.stringify(data)}`);
                return data;
            } catch (e) {
                console.log(`   ❌ Invalid JSON despite header: ${e.message}`);
            }
        } else {
            const text = await res.text();
            console.log(`   ❌ NON-JSON Response (First 200 chars):`);
            console.log(`   ${text.substring(0, 200)}...`);
        }
    };

    // 1. Check Test Route
    try {
        const res = await fetch(`${BASE_URL}/test`);
        await handleResponse('TEST ROUTE', res);
    } catch (e) { console.error(`TEST Failed: ${e.message}`); }

    // 2. Check Admin Login
    try {
        const res = await fetch(`${BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminCreds)
        });
        await handleResponse('ADMIN LOGIN', res);
    } catch (e) { console.error(`ADMIN Failed: ${e.message}`); }
};

verifyProd();
