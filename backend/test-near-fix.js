const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Dynamically require the model to avoid path issues
const Accommodation = require('./models/Accommodation');

dotenv.config({ path: path.join(__dirname, '.env') });

const testNear = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const lat = 22.3072;
        const lng = 73.1812;
        const radius = 10; // km

        console.log(`\n🔍 Searching for accommodations near (${lat}, ${lng}) within ${radius}km...`);

        const result = await Accommodation.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000
                }
            }
        });

        console.log(`\n📊 Found ${result.length} accommodations`);
        result.forEach(acc => console.log(`- ${acc.title}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testNear();
