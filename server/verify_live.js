// Verify Login using Fetch

// If axios is not installed in server dir, we can use built-in fetch (Node 18+)
// detailed verification script

const verifyLogin = async () => {
    const URL = 'https://win365v01.vercel.app/api/auth/admin-login';
    const CREDENTIALS = {
        email: 'purusothhrm@gmail.com',
        password: 'Win365Admin2026'
    };

    console.log(`Attempting login to: ${URL}`);

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(CREDENTIALS)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL');
            console.log('Token received:', data.token ? 'Yes' : 'No');
            console.log('User Role:', data.user?.role);
        } else {
            console.log('❌ LOGIN FAILED');
            console.log('Status:', response.status);
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('❌ NETWORK/SERVER ERROR:', error.message);
    }
};

verifyLogin();
