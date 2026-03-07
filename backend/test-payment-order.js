const axios = require('axios');

const testPaymentOrder = async () => {
  try {
    console.log('🧪 Testing Payment Order Creation...\n');

    // First, login to get a token
    console.log('1️⃣ Logging in as student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo.student1@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Get booking ID
    console.log('\n2️⃣ Fetching bookings...');
    const bookingsResponse = await axios.get('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const bookings = bookingsResponse.data.data;
    if (bookings.length === 0) {
      console.log('❌ No bookings found. Please create a booking first.');
      process.exit(1);
    }

    const booking = bookings[0];
    console.log(`✅ Found booking: ${booking._id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment Status: ${booking.paymentStatus}`);

    if (booking.status !== 'accepted') {
      console.log('\n⚠️  Booking must be accepted before payment. Skipping payment order test.');
      process.exit(0);
    }

    // Create payment order
    console.log(`\n3️⃣ Creating payment order for booking ${booking._id}...`);
    const paymentResponse = await axios.post(
      `http://localhost:5000/api/bookings/${booking._id}/payment`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const paymentData = paymentResponse.data.data;
    console.log('✅ Payment order created successfully!');
    console.log(`   Razorpay Order ID: ${paymentData.razorpayOrderId}`);
    console.log(`   Amount (paise): ${paymentData.amount}`);
    console.log(`   Amount (rupees): ₹${paymentData.amount / 100}`);
    console.log(`   Razorpay Key: ${paymentData.key}`);

    if (!paymentData.key) {
      console.log('\n❌ ERROR: Razorpay Key is not being returned!');
      console.log('   Check your backend .env file for RAZORPAY_KEY_ID');
      process.exit(1);
    }

    console.log('\n✅ All tests passed! Payment order creation is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
      console.error('   Details:', error.response.data.error);
    }
    if (error.response?.status === 401) {
      console.error('\n   This is an authentication error. Check:');
      console.error('   1. Is the backend running on port 5000?');
      console.error('   2. Are your credentials correct?');
    }
    process.exit(1);
  }
};

testPaymentOrder();
