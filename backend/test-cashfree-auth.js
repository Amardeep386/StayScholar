const axios = require('axios');
require('dotenv').config();

const testCashfreeAuth = async () => {
    const CASHFREE_ENV = 'TEST';
    const CASHFREE_API_URL = CASHFREE_ENV === 'PROD'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    console.log(`🌐 Testing Cashfree ${CASHFREE_ENV} environment...`);
    console.log(`📍 URL: ${CASHFREE_API_URL}/orders`);
    console.log(`🔑 App ID: ${appId ? appId.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`🔑 Secret: ${secretKey ? secretKey.substring(0, 10) + '...' : 'MISSING'}\n`);

    const orderPayload = {
        order_id: `test_auth_${Date.now()}`,
        order_amount: 1,
        order_currency: 'INR',
        customer_details: {
            customer_id: 'test_user_id',
            customer_name: 'Test User',
            customer_email: 'test@example.com',
            customer_phone: '9999999999'
        }
    };

    try {
        const response = await axios.post(
            `${CASHFREE_API_URL}/orders`,
            orderPayload,
            {
                headers: {
                    'x-api-version': '2023-08-01',
                    'x-client-id': appId,
                    'x-client-secret': secretKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Authentication SUCCESSFUL!');
        console.log('📦 Order Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Authentication FAILED!');
        console.error('📊 Status:', error.response?.status);
        console.error('📄 Response Data:', JSON.stringify(error.response?.data, null, 2));

        if (error.response?.data?.message === 'Authentication failed') {
            console.log('\n💡 Tip: Your credentials might be invalid for this environment.');
            console.log(`   Current ENV: ${CASHFREE_ENV}`);
            console.log('   Check if these are TEST keys or PRODUCTION keys.');
        }
    }
};

testCashfreeAuth();
