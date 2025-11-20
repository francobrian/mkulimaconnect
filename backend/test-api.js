const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🚀 Testing MkulimaConnect API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test registration
    console.log('\n2. Testing user registration...');
    const userData = {
      name: 'Test Farmer',
      email: `farmer${Date.now()}@test.com`,
      password: 'password123',
      role: 'farmer',
      phone: '+254712345678',
      location: {
        type: 'Point',
        coordinates: [36.8219, -1.2921],
        address: 'Nairobi, Kenya'
      },
      farmData: {
        farmName: 'Test Farm',
        farmSize: 5,
        farmType: 'organic',
        crops: [
          {
            name: 'Tomatoes',
            variety: 'Roma',
            plantingSeason: 'March-April',
            harvestTime: 90
          }
        ]
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ User registered:', registerResponse.data.user.email);
    
    const token = registerResponse.data.token;
    console.log('✅ Token received:', token ? 'Yes' : 'No');

    // Test getting profile
    console.log('\n3. Testing profile retrieval...');
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.name);

    // Test products endpoint
    console.log('\n4. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products retrieved:', productsResponse.data.products.length, 'products');

    // Test farmers endpoint
    console.log('\n5. Testing farmers endpoint...');
    const farmersResponse = await axios.get(`${API_BASE}/farmers`);
    console.log('✅ Farmers retrieved:', farmersResponse.data.length, 'farmers');

    console.log('\n🎉 All backend tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testAPI();