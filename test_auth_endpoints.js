// Test script for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSignup() {
  console.log('=== Testing Signup Endpoint ===');
  
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  };

  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ Signup successful:', response.data);
    return testUser;
  } catch (error) {
    console.error('❌ Signup failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
      console.error('  Headers:', error.response.headers);
    } else if (error.request) {
      console.error('  No response received. Server might be down or CORS issue.');
      console.error('  Request:', error.request);
    } else {
      console.error('  Error:', error.message);
    }
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n=== Testing Login Endpoint ===');
  
  const credentials = {
    email,
    password
  };

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    console.log('✅ Login successful:', {
      success: response.data.success,
      token: response.data.token ? 'Present' : 'Missing',
      user: response.data.user
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    } else if (error.request) {
      console.error('  No response received. Server might be down or CORS issue.');
    } else {
      console.error('  Error:', error.message);
    }
    return null;
  }
}

async function testValidateToken(token) {
  console.log('\n=== Testing Token Validation ===');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/validate-token`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Token validation successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Token validation failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting authentication tests...\n');
  
  // Test 1: Signup
  const testUser = await testSignup();
  
  if (testUser) {
    // Test 2: Login with correct credentials
    const token = await testLogin(testUser.email, testUser.password);
    
    if (token) {
      // Test 3: Validate token
      await testValidateToken(token);
      
      // Test 4: Login with wrong password
      console.log('\n=== Testing Login with Wrong Password ===');
      await testLogin(testUser.email, 'wrongpassword');
    }
  }
  
  // Test 5: Check server status
  console.log('\n=== Testing Server Status ===');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', response.status);
  } catch (error) {
    console.error('❌ Server might be down:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (e) {
  console.log('Axios not found. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('Axios installed. Running tests...');
    runTests();
  } catch (installError) {
    console.error('Failed to install axios:', installError.message);
  }
}