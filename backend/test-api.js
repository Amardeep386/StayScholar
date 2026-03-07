// Test script to verify AccommodationDetail API is working
const testAccommodationDetail = async () => {
  try {
    // Test 1: Get all accommodations
    console.log('Testing: GET /api/accommodations');
    let response = await fetch('http://localhost:5000/api/accommodations');
    let data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      console.error('❌ No accommodations found!');
      return;
    }
    
    console.log(`✅ Found ${data.data.length} accommodations`);
    const firstAccommodation = data.data[0];
    console.log(`✅ First accommodation ID: ${firstAccommodation._id}`);
    
    // Test 2: Get single accommodation detail
    console.log(`\nTesting: GET /api/accommodations/${firstAccommodation._id}`);
    response = await fetch(`http://localhost:5000/api/accommodations/${firstAccommodation._id}`);
    data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch accommodation detail!');
      console.error('Error:', data.message);
      return;
    }
    
    const accommodation = data.data;
    console.log(`✅ Successfully loaded accommodation details`);
    console.log(`   Title: ${accommodation.title}`);
    console.log(`   Type: ${accommodation.type}`);
    console.log(`   City: ${accommodation.address.city}`);
    console.log(`   Rent: ₹${accommodation.rent}`);
    console.log(`   Owner: ${accommodation.owner.name}`);
    
    console.log('\n✅ ALL TESTS PASSED! The AccommodationDetail API is working correctly.');
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
};

// Run the test
testAccommodationDetail();
