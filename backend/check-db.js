const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Accommodation = require('./models/Accommodation');
const User = require('./models/User');

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayscholars', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check accommodations
    const count = await Accommodation.countDocuments();
    console.log(`\n📊 Total Accommodations: ${count}`);

    if (count > 0) {
      const accommodations = await Accommodation.find()
        .populate('owner', 'name email')
        .limit(5);

      console.log('\n📋 Sample Accommodations:');
      accommodations.forEach((acc, index) => {
        console.log(`\n${index + 1}. ID: ${acc._id}`);
        console.log(`   Title: ${acc.title}`);
        console.log(`   Type: ${acc.type}`);
        console.log(`   City: ${acc.address?.city}`);
        console.log(`   Owner: ${acc.owner?.name}`);
        console.log(`   Active: ${acc.isActive}`);
      });

      console.log('\n✅ Database is properly seeded!');
    } else {
      console.log('⚠️  No accommodations found. Run: npm run seed');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
