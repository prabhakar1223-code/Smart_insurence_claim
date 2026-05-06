const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const timestamp = Date.now();
const TEST_EMAIL = `testuser_${timestamp}@example.com`;
const TEST_PASSWORD = 'TestPassword123';
const TEST_NAME = 'Test User';

async function testAuth() {
  console.log('🔍 Testing Authentication');
  console.log('========================');
  console.log(`Test email: ${TEST_EMAIL}`);
  
  try {
    // Test signup
    console.log('\n1. Testing signup...');
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Signup successful!');
    console.log('   Response:', signupRes.data);
    
    // Test login with same credentials
    console.log('\n2. Testing login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login successful!');
    console.log('   Token present:', !!loginRes.data.token);
    console.log('   User email:', loginRes.data.user?.email);
    
    // Test wrong password
    console.log('\n3. Testing wrong password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'WrongPassword123'
      });
      console.log('❌ Wrong password should have failed!');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ Wrong password correctly rejected!');
        console.log('   Error:', err.response.data.error);
      } else {
        console.log('❌ Unexpected error:', err.message);
      }
    }
    
    console.log('\n🎉 Authentication flow is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAuth();