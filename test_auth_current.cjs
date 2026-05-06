// Test current authentication state
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'password123';
const testName = 'Test User';

console.log('=== TESTING CURRENT AUTHENTICATION STATE ===\n');

// Test 1: Sign up
console.log('1. Testing signup...');
const signupData = JSON.stringify({
  name: testName,
  email: testEmail,
  password: testPassword
});

const signupReq = http.request(`${BASE_URL}/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': signupData.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    try {
      const result = JSON.parse(data);
      console.log(`   Response:`, result);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('   ✅ Signup successful');
        
        // Test 2: Sign in with same credentials
        setTimeout(() => {
          console.log('\n2. Testing signin with same credentials...');
          const loginData = JSON.stringify({
            email: testEmail,
            password: testPassword
          });
          
          const loginReq = http.request(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': loginData.length
            }
          }, (loginRes) => {
            let loginData = '';
            loginRes.on('data', chunk => loginData += chunk);
            loginRes.on('end', () => {
              console.log(`   Status: ${loginRes.statusCode}`);
              try {
                const loginResult = JSON.parse(loginData);
                console.log(`   Response:`, loginResult);
                
                if (loginRes.statusCode === 200) {
                  console.log('   ✅ Login successful');
                  console.log('\n=== AUTHENTICATION WORKING CORRECTLY ===');
                } else {
                  console.log('   ❌ Login failed');
                  console.log('\n=== AUTHENTICATION ISSUE DETECTED ===');
                  console.log('Possible issues:');
                  console.log('1. User not saved correctly');
                  console.log('2. Password comparison failing');
                  console.log('3. Email lookup failing');
                }
              } catch (e) {
                console.log('   ❌ Failed to parse login response:', e.message);
              }
            });
          });
          
          loginReq.on('error', (err) => {
            console.log('   ❌ Login request error:', err.message);
          });
          
          loginReq.write(loginData);
          loginReq.end();
        }, 1000);
      } else {
        console.log('   ❌ Signup failed');
      }
    } catch (e) {
      console.log('   ❌ Failed to parse response:', e.message);
    }
  });
});

signupReq.on('error', (err) => {
  console.log('   ❌ Signup request error:', err.message);
});

signupReq.write(signupData);
signupReq.end();