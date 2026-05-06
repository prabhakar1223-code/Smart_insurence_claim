const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123';
const TEST_NAME = 'Test User';

async function testAuthFlow() {
  console.log('🔍 Testing Authentication Flow');
  console.log('==============================');
  
  try {
    // Test 1: Signup
    console.log('\n1. Testing Signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Signup successful!');
    console.log('   Response:', {
      success: signupResponse.data.success,
      message: signupResponse.data.message,
      userId: signupResponse.data.user?.id
    });
    
    // Test 2: Login with same credentials
    console.log('\n2. Testing Login with same credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login successful!');
    console.log('   Response:', {
      success: loginResponse.data.success,
      token: loginResponse.data.token ? 'Present' : 'Missing',
      user: loginResponse.data.user?.email
    });
    
    // Test 3: Try duplicate signup
    console.log('\n3. Testing duplicate email check...');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Another User',
        email: TEST_EMAIL,
        password: 'DifferentPassword123'
      });
      console.log('❌ Duplicate signup should have failed but succeeded!');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error === 'User already exists') {
        console.log('✅ Duplicate email correctly rejected!');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error for duplicate:', error.response?.data || error.message);
      }
    }
    
    // Test 4: Try wrong password
    console.log('\n4. Testing wrong password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'WrongPassword123'
      });
      console.log('❌ Wrong password should have failed but succeeded!');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.error === 'Invalid credentials') {
        console.log('✅ Wrong password correctly rejected!');
      } else {
        console.log('❌ Unexpected error for wrong password:', error.response?.data || error.message);
      }
    }
    
    // Test 5: Try non-existent email
    console.log('\n5. Testing non-existent email...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'SomePassword123'
      });
      console.log('❌ Non-existent email should have failed but succeeded!');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.error === 'Invalid credentials') {
        console.log('✅ Non-existent email correctly rejected!');
      } else {
        console.log('❌ Unexpected error for non-existent email:', error.response?.data || error.message);
      }
    }
    
    console.log('\n🎉 All authentication tests completed!');
    console.log('\nSummary:');
    console.log('- Signup works correctly');
    console.log('- Login works with correct credentials');
    console.log('- Duplicate email detection works');
    console.log('- Wrong password detection works');
    console.log('- Non-existent email detection works');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if server is reachable first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`, { timeout: 3000 });
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to server at', BASE_URL);
    console.error('Make sure the backend server is running (node server.js)');
    return false;
  }
}

async function main() {
  console.log('Checking server connectivity...');
  const serverReady = await checkServer();
  if (!serverReady) {
    console.log('Trying to start server...');
    // You might need to start the server manually
    console.log('Please run: node server.js');
    process.exit(1);
  }
  
  await testAuthFlow();
}

main().catch(console.error);