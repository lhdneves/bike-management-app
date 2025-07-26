// Simple test script to verify authentication endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      confirmEmail: `test_${Date.now()}@example.com`,
      phone: '11999999999',
      password: 'Test123456',
      confirmPassword: 'Test123456',
      acceptTerms: true
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('   User:', registerResponse.data.data.user.name);
      console.log('   Token:', registerResponse.data.data.token ? 'Generated' : 'Missing');
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Try to register with same email (should fail)
    console.log('\n2️⃣ Testing duplicate email registration...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      console.log('❌ Duplicate registration should have failed');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Correctly rejected duplicate email:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Login with correct credentials
    console.log('\n3️⃣ Testing user login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      console.log('✅ Login successful:', loginResponse.data.message);
      console.log('   User:', loginResponse.data.data.user.name);
      console.log('   Token:', loginResponse.data.data.token ? 'Generated' : 'Missing');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Login with wrong password
    console.log('\n4️⃣ Testing login with wrong password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: registerData.email,
        password: 'wrongpassword'
      });
      console.log('❌ Login with wrong password should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected wrong password:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 5: Forgot password
    console.log('\n5️⃣ Testing forgot password...');
    try {
      const forgotResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: registerData.email
      });
      console.log('✅ Forgot password successful:', forgotResponse.data.message);
    } catch (error) {
      console.log('❌ Forgot password failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Authentication tests completed!');

  } catch (error) {
    console.error('💥 Test setup failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Backend server is running on port 3001');
    console.log('   - Database is connected');
    console.log('   - Run: cd backend && npm run dev');
  }
}

// Run tests
testAuthEndpoints();