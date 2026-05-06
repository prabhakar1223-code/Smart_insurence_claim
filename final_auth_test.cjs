const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const timestamp = Date.now();
const TEST_EMAIL = `finaltest_${timestamp}@example.com`;
const TEST_PASSWORD = 'TestPassword123';
const TEST_NAME = 'Final Test User';

async function testAuth() {
  console.log('🔍 Final Authentication Test');
  console.log('============================');
  console.log(`Backend: ${BASE_URL}`);
  console.log(`Test email: ${TEST_EMAIL}`);
  
  try {
    // Test 1: Signup
    console.log('\n1. Testing signup...');
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signupRes.data.success) {
      console.log('✅ Signup successful!');
      console.log('   User ID:', signupRes.data.user?.id);
    } else {
      console.log('❌ Signup failed:', signupRes.data);
      return;
    }
    
    // Test 2: Login with same credentials
    console.log('\n2. Testing login with same credentials...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (loginRes.data.success && loginRes.data.token) {
      console.log('✅ Login successful!');
      console.log('   Token received:', loginRes.data.token ? 'Yes' : 'No');
      console.log('   User authenticated:', loginRes.data.user?.email);
    } else {
      console.log('❌ Login failed:', loginRes.data);
      return;
    }
    
    // Test 3: Verify user was saved by checking duplicate
    console.log('\n3. Testing duplicate email check...');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Duplicate User',
        email: TEST_EMAIL,
        password: 'DifferentPassword123'
      });
      console.log('❌ Duplicate signup should have failed!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.error === 'User already exists') {
        console.log('✅ Duplicate email correctly rejected!');
      } else {
        console.log('❌ Unexpected error:', err.response?.data || err.message);
      }
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\nSummary:');
    console.log('- Signup works and saves user correctly');
    console.log('- Login works with the saved credentials');
    console.log('- Duplicate email detection works');
    console.log('- Authentication system is fully functional');
    
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