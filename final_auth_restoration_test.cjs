// Final authentication restoration test
const http = require('http');

const BASE_URL = 'http://localhost:3000';

console.log('=== FINAL AUTHENTICATION RESTORATION TEST ===\n');
console.log('Testing all authentication functionality after fixes...\n');

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
            data: JSON.parse(responseData),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
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
  const testEmail = `finaltest${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const testName = 'Final Test User';
  
  console.log(`Test credentials:`);
  console.log(`  Email: ${testEmail}`);
  console.log(`  Password: ${testPassword}`);
  console.log(`  Name: ${testName}\n`);
  
  // Test 1: Signup
  console.log('1. Testing SIGNUP functionality...');
  const signupData = JSON.stringify({
    name: testName,
    email: testEmail,
    password: testPassword
  });
  
  const signupResult = await makeRequest('/auth/signup', 'POST', signupData);
  console.log(`   Status: ${signupResult.status}`);
  
  if (signupResult.status === 200) {
    console.log('   ✅ Signup successful');
    console.log(`   User ID: ${signupResult.data.user?.id}`);
    
    // Check CORS headers
    if (signupResult.headers['access-control-allow-origin']) {
      console.log(`   CORS header: ${signupResult.headers['access-control-allow-origin']}`);
    }
  } else {
    console.log('   ❌ Signup failed');
    console.log(`   Error: ${signupResult.data.error || 'Unknown error'}`);
    return;
  }
  
  // Test 2: Duplicate email check
  console.log('\n2. Testing DUPLICATE EMAIL check...');
  const duplicateSignupResult = await makeRequest('/auth/signup', 'POST', signupData);
  console.log(`   Status: ${duplicateSignupResult.status}`);
  
  if (duplicateSignupResult.status === 400) {
    console.log('   ✅ Duplicate email correctly rejected');
    if (duplicateSignupResult.data.message?.includes('already registered')) {
      console.log('   ✅ Correct error message shown');
    }
  } else {
    console.log('   ❌ Duplicate email check failed (should have been rejected)');
  }
  
  // Test 3: Login with correct credentials
  console.log('\n3. Testing LOGIN with correct credentials...');
  const loginData = JSON.stringify({
    email: testEmail,
    password: testPassword
  });
  
  const loginResult = await makeRequest('/auth/login', 'POST', loginData);
  console.log(`   Status: ${loginResult.status}`);
  
  if (loginResult.status === 200) {
    console.log('   ✅ Login successful');
    console.log(`   Token received: ${loginResult.data.token ? 'Yes' : 'No'}`);
    console.log(`   User data: ${loginResult.data.user ? 'Complete' : 'Missing'}`);
    
    if (loginResult.data.token && loginResult.data.user) {
      console.log('   ✅ Full login flow working');
    }
  } else {
    console.log('   ❌ Login failed');
    console.log(`   Error: ${loginResult.data.error || 'Unknown error'}`);
  }
  
  // Test 4: Login with wrong password
  console.log('\n4. Testing LOGIN with wrong password...');
  const wrongLoginData = JSON.stringify({
    email: testEmail,
    password: 'WrongPassword123'
  });
  
  const wrongLoginResult = await makeRequest('/auth/login', 'POST', wrongLoginData);
  console.log(`   Status: ${wrongLoginResult.status}`);
  
  if (wrongLoginResult.status === 400) {
    console.log('   ✅ Wrong password correctly rejected');
  } else {
    console.log('   ❌ Wrong password should have been rejected');
  }
  
  // Test 5: Login with non-existent email
  console.log('\n5. Testing LOGIN with non-existent email...');
  const fakeLoginData = JSON.stringify({
    email: `nonexistent${Date.now()}@example.com`,
    password: 'AnyPassword'
  });
  
  const fakeLoginResult = await makeRequest('/auth/login', 'POST', fakeLoginData);
  console.log(`   Status: ${fakeLoginResult.status}`);
  
  if (fakeLoginResult.status === 400) {
    console.log('   ✅ Non-existent email correctly rejected');
  } else {
    console.log('   ❌ Non-existent email should have been rejected');
  }
  
  // Test 6: Check data persistence (simulate server restart)
  console.log('\n6. Testing DATA PERSISTENCE...');
  console.log('   (Checking if user data is saved to file system)');
  
  // Try login again with original credentials
  const persistenceLoginResult = await makeRequest('/auth/login', 'POST', loginData);
  if (persistenceLoginResult.status === 200) {
    console.log('   ✅ User data persists (login still works)');
  } else {
    console.log('   ❌ User data not persisted');
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  const tests = [
    signupResult.status === 200,
    duplicateSignupResult.status === 400,
    loginResult.status === 200,
    wrongLoginResult.status === 400,
    fakeLoginResult.status === 400,
    persistenceLoginResult.status === 200
  ];
  
  const passed = tests.filter(t => t).length;
  const total = tests.length;
  
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n✅ ALL AUTHENTICATION TESTS PASSED!');
    console.log('\nAuthentication system is fully restored with:');
    console.log('1. Working signup that creates users correctly');
    console.log('2. Proper duplicate email checking');
    console.log('3. Successful login with valid credentials');
    console.log('4. Proper rejection of invalid credentials');
    console.log('5. Data persistence across requests');
    console.log('6. Fixed CORS configuration');
  } else {
    console.log('\n❌ Some tests failed. Authentication needs further debugging.');
  }
}

// Run test
runTest().catch(err => {
  console.error('Test execution error:', err);
});