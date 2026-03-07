const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Accommodation = require('./models/Accommodation');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayscholars', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await User.deleteMany({ email: { $regex: '^demo' } });
    await Accommodation.deleteMany({ title: { $regex: 'Demo' } });

    // Create demo student accounts
    const students = await User.create([
      {
        name: 'Raj Kumar',
        email: 'demo.student1@example.com',
        password: 'password123',
        role: 'student',
        phone: '9876543210',
        college: 'IIT Delhi',
        course: 'B.Tech Computer Science',
        year: '2nd Year',
        isVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'demo.student2@example.com',
        password: 'password123',
        role: 'student',
        phone: '9876543211',
        college: 'Delhi University',
        course: 'BA Economics',
        year: '1st Year',
        isVerified: true
      },
      {
        name: 'Arjun Singh',
        email: 'demo.student3@example.com',
        password: 'password123',
        role: 'student',
        phone: '9876543212',
        college: 'Ashoka University',
        course: 'B.Tech Electronics',
        year: '3rd Year',
        isVerified: true
      }
    ]);

    console.log('✅ Created 3 demo student accounts');

    // Create demo owner accounts
    const owners = await User.create([
      {
        name: 'Rajesh Property Group',
        email: 'demo.owner1@example.com',
        password: 'password123',
        role: 'owner',
        phone: '9988776655',
        isVerified: true
      },
      {
        name: 'HomeStay Solutions',
        email: 'demo.owner2@example.com',
        password: 'password123',
        role: 'owner',
        phone: '9988776656',
        isVerified: true
      },
      {
        name: 'Urban Living Rentals',
        email: 'demo.owner3@example.com',
        password: 'password123',
        role: 'owner',
        phone: '9988776657',
        isVerified: true
      }
    ]);

    console.log('✅ Created 3 demo owner accounts');

    // Create demo accommodations
    const accommodations = await Accommodation.create([
      {
        owner: owners[0]._id,
        title: 'Demo Cozy PG Near MS University',
        description: 'Spacious and well-maintained PG for students near MS University Vadodara. Includes WiFi, daily water supply, and 24/7 security. Walking distance to university campus.',
        type: 'PG',
        address: {
          street: '123 University Road',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390001',
          landmark: 'Near MS University Main Gate'
        },
        location: {
          type: 'Point',
          coordinates: [73.1812, 22.3072] // [longitude, latitude]
        },
        rent: 6000,
        deposit: 12000,
        availableFrom: new Date('2026-02-01'),
        amenities: ['WiFi', 'Water Supply', 'Electricity', 'Fan/AC', 'Bed', 'Wardrobe'],
        rules: ['No outside visitors after 10 PM', 'No smoking', 'Quiet hours 10 PM - 8 AM'],
        nearbyColleges: [
          { name: 'MS University', distance: 0.5 },
          { name: 'IIT Gandhinagar', distance: 35 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: true,
          security: true,
          laundry: true,
          kitchen: false,
          ac: true,
          furnished: true
        },
        occupancy: {
          total: 4,
          available: 2
        },
        genderPreference: 'Any',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.5,
          count: 8
        }
      },
      {
        owner: owners[0]._id,
        title: 'Demo Modern Flat in Race Course Area',
        description: 'Modern 2BHK apartment in prime location. Fully furnished with kitchen, balcony, and parking. Perfect for students or young professionals.',
        type: 'Flat',
        address: {
          street: '456 Race Course Road',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390007',
          landmark: 'Near Race Course Ground'
        },
        location: {
          type: 'Point',
          coordinates: [73.1959, 22.3039]
        },
        rent: 12000,
        deposit: 24000,
        availableFrom: new Date('2026-02-15'),
        amenities: ['WiFi', 'Kitchen', 'Parking', 'Balcony', 'Fully Furnished', 'AC'],
        rules: ['Vegetarian/Non-veg meals allowed', 'Pets allowed', 'No smoking inside'],
        nearbyColleges: [
          { name: 'MS University', distance: 2 },
          { name: 'Vadodara Institute of Technology', distance: 8 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: true,
          security: true,
          laundry: true,
          kitchen: true,
          ac: true,
          furnished: true
        },
        occupancy: {
          total: 2,
          available: 1
        },
        genderPreference: 'Female',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.8,
          count: 12
        }
      },
      {
        owner: owners[1]._id,
        title: 'Demo Budget Hostel in VIT Area',
        description: 'Affordable hostel accommodation near Vadodara Institute of Technology. Great for students looking for economical options. Shared facilities, common study area.',
        type: 'Hostel',
        address: {
          street: '789 VIT Campus Lane',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '391510',
          landmark: 'Near VIT Vadodara'
        },
        location: {
          type: 'Point',
          coordinates: [73.3198, 22.2639]
        },
        rent: 4000,
        deposit: 8000,
        availableFrom: new Date('2026-01-30'),
        amenities: ['WiFi', 'Shared Kitchen', 'Common Study Area', 'Bed', 'Locker'],
        rules: ['Curfew at 11 PM', 'Weekly cleaning', 'No outside food'],
        nearbyColleges: [
          { name: 'Vadodara Institute of Technology', distance: 1.5 },
          { name: 'Nirma University', distance: 25 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: false,
          security: true,
          laundry: true,
          kitchen: true,
          ac: false,
          furnished: true
        },
        occupancy: {
          total: 8,
          available: 3
        },
        genderPreference: 'Male',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.2,
          count: 15
        }
      },
      {
        owner: owners[1]._id,
        title: 'Demo Luxury PG in Akota',
        description: 'Premium PG with luxury amenities. AC rooms, attached bathrooms, healthy meals included. Perfect for serious students.',
        type: 'PG',
        address: {
          street: '321 Akota Avenue',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390020',
          landmark: 'Akota Prime Location'
        },
        location: {
          type: 'Point',
          coordinates: [73.2013, 22.3168]
        },
        rent: 10000,
        deposit: 20000,
        availableFrom: new Date('2026-02-10'),
        amenities: ['WiFi', 'AC Room', 'Attached Bathroom', 'Meals', 'Study Desk', 'Laundry'],
        rules: ['Academic focused environment', 'Quiet hours 10 PM - 8 AM', 'No late night outings'],
        nearbyColleges: [
          { name: 'MS University', distance: 3 },
          { name: 'Vadodara Institute of Technology', distance: 12 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: true,
          security: true,
          laundry: true,
          kitchen: false,
          ac: true,
          furnished: true
        },
        occupancy: {
          total: 6,
          available: 2
        },
        genderPreference: 'Any',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.7,
          count: 10
        }
      },
      {
        owner: owners[2]._id,
        title: 'Demo Shared Room in Gotri',
        description: 'Affordable shared accommodation in heart of Vadodara. Great for collaborative living. Walking distance to shopping, dining, entertainment.',
        type: 'Shared Room',
        address: {
          street: '654 Gotri Road',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390021',
          landmark: 'Gotri Commercial Area'
        },
        location: {
          type: 'Point',
          coordinates: [73.1698, 22.3245]
        },
        rent: 4500,
        deposit: 9000,
        availableFrom: new Date('2026-02-05'),
        amenities: ['WiFi', 'Shared Bathroom', 'Common Area', 'Bed'],
        rules: ['Respectful to roommates', 'No loud music after 10 PM'],
        nearbyColleges: [
          { name: 'MS University', distance: 5 },
          { name: 'PDPU', distance: 8 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: false,
          security: false,
          laundry: false,
          kitchen: false,
          ac: false,
          furnished: true
        },
        occupancy: {
          total: 3,
          available: 1
        },
        genderPreference: 'Female',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.0,
          count: 6
        }
      },
      {
        owner: owners[2]._id,
        title: 'Demo Premium Flat in Alkapuri',
        description: 'Stunning 3BHK flat with all modern amenities. Located in upscale society with gym, pool, and security. Great for professionals and senior students.',
        type: 'Flat',
        address: {
          street: '987 Alkapuri Premium Housing',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390005',
          landmark: 'Alkapuri Upscale Area'
        },
        location: {
          type: 'Point',
          coordinates: [73.2092, 22.3398]
        },
        rent: 18000,
        deposit: 36000,
        availableFrom: new Date('2026-02-20'),
        amenities: ['WiFi', 'AC', 'Fully Furnished', 'Parking', 'Gym', 'Swimming Pool', 'Security'],
        rules: ['Guests allowed with notice', 'Professional environment'],
        nearbyColleges: [
          { name: 'MS University', distance: 4 },
          { name: 'Vadodara Institute of Technology', distance: 10 }
        ],
        facilities: {
          wifi: true,
          electricity: true,
          water: true,
          parking: true,
          security: true,
          laundry: true,
          kitchen: true,
          ac: true,
          furnished: true
        },
        occupancy: {
          total: 3,
          available: 1
        },
        genderPreference: 'Any',
        isVerified: true,
        isActive: true,
        rating: {
          average: 4.9,
          count: 9
        }
      }
    ]);

    console.log('✅ Created 6 demo accommodations');

    // Display credentials
    console.log('\n📋 Demo Accounts Created:');
    console.log('\n👨‍🎓 Student Accounts:');
    console.log('1. Email: demo.student1@example.com | Password: password123');
    console.log('2. Email: demo.student2@example.com | Password: password123');
    console.log('3. Email: demo.student3@example.com | Password: password123');

    console.log('\n🏠 Owner Accounts:');
    console.log('1. Email: demo.owner1@example.com | Password: password123');
    console.log('2. Email: demo.owner2@example.com | Password: password123');
    console.log('3. Email: demo.owner3@example.com | Password: password123');

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
