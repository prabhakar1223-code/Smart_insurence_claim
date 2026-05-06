// Test duplicate email check
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const testEmail = `duplicate${Date.now()}@example.com`;
const testPassword = 'password123';
const testName = 'Duplicate Test User';

console.log('=== TESTING DUPLICATE EMAIL CHECK ===\n');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log(`Test email: ${testEmail}`);
  
  // First signup - should succeed
  console.log('\n1. First signup attempt...');
  const signupData1 = JSON.stringify({
    name: testName,
    email: testEmail,
    password: testPassword
  });
  
  const result1 = await makeRequest('/auth/signup', 'POST', signupData1);
  console.log(`   Status: ${result1.status}`);
  console.log(`   Response:`, result1.data);
  
  if (result1.status === 200 || result1.status === 201) {
    console.log('   ✅ First signup successful');
  } else {
    console.log('   ❌ First signup failed unexpectedly');
    return;
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Second signup with same email - should fail
  console.log('\n2. Second signup attempt (same email)...');
  const signupData2 = JSON.stringify({
    name: 'Another User',
    email: testEmail,  // Same email!
    password: 'differentpassword'
  });
  
  const result2 = await makeRequest('/auth/signup', 'POST', signupData2);
  console.log(`   Status: ${result2.status}`);
  console.log(`   Response:`, result2.data);
  
  if (result2.status === 400) {
    console.log('   ✅ Duplicate email check working (correctly rejected)');
    if (result2.data.error === 'User already exists' || 
        result2.data.message?.includes('already registered')) {
      console.log('   ✅ Correct error message shown');
    } else {
      console.log('   ⚠️  Wrong error message format');
    }
  } else {
    console.log('   ❌ Duplicate email check NOT working (should have rejected)');
  }
  
  // Test login with original credentials - should work
  console.log('\n3. Testing login with original credentials...');
  const loginData = JSON.stringify({
    email: testEmail,
    password: testPassword
  });
  
  const loginResult = await makeRequest('/auth/login', 'POST', loginData);
  console.log(`   Status: ${loginResult.status}`);
  
  if (loginResult.status === 200) {
    console.log('   ✅ Login successful with original credentials');
  } else {
    console.log('   ❌ Login failed (possible data corruption)');
    console.log('   Response:', loginResult.data);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

runTest().catch(err => {
  console.error('Test error:', err);
});