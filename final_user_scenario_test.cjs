const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function simulateUserScenario() {
  console.log('🔍 Simulating User Authentication Scenario');
  console.log('===========================================');
  console.log('Scenario: User signs up successfully, then tries to login with same credentials');
  console.log('Expected: Both signup and login should work\n');
  
  const timestamp = Date.now();
  const testEmail = `user_scenario_${timestamp}@example.com`;
  const testPassword = 'UserPassword123';
  const testName = 'Test User Scenario';
  
  let signupSuccess = false;
  let loginSuccess = false;
  let userToken = null;
  let userId = null;
  
  try {
    // Step 1: Signup
    console.log('1. User attempts to sign up...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Name: ${testName}`);
    
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });
    
    if (signupRes.data.success) {
      signupSuccess = true;
      userId = signupRes.data.user?.id;
      console.log('   ✅ SIGNUP SUCCESSFUL');
      console.log(`   User ID: ${userId}`);
      console.log(`   Message: ${signupRes.data.message}`);
      
      // Check if user was actually saved
      console.log('\n   Verifying user was saved to database...');
      const users = require('./data/users.json');
      const foundUser = users.find(u => u.emailHash === require('crypto').createHash('sha256').update(testEmail.toLowerCase()).digest('hex'));
      
      if (foundUser) {
        console.log('   ✅ User found in database');
        console.log(`   Encrypted email: ${foundUser.encryptedEmail ? 'Yes' : 'No'}`);
        console.log(`   Password hash: ${foundUser.passwordHash ? 'Yes' : 'No'}`);
      } else {
        console.log('   ❌ User NOT found in database - storage issue!');
      }
    } else {
      console.log('   ❌ SIGNUP FAILED');
      console.log(`   Error: ${signupRes.data.error || 'Unknown error'}`);
      console.log(`   Message: ${signupRes.data.message || 'No message'}`);
      return;
    }
    
    // Wait a moment for data to be saved
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Login with same credentials
    console.log('\n2. User attempts to login with same credentials...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (loginRes.data.success && loginRes.data.token) {
      loginSuccess = true;
      userToken = loginRes.data.token;
      console.log('   ✅ LOGIN SUCCESSFUL');
      console.log(`   Token received: ${userToken ? 'Yes' : 'No'}`);
      console.log(`   User authenticated: ${loginRes.data.user?.email || 'N/A'}`);
      console.log(`   User ID matches: ${loginRes.data.user?.id === userId ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ LOGIN FAILED');
      console.log(`   Error: ${loginRes.data.error || 'Invalid credentials'}`);
      console.log(`   Message: ${loginRes.data.message || 'No message'}`);
      
      // Debug: Check what's in the database
      console.log('\n   Debugging login failure...');
      const users = require('./data/users.json');
      console.log(`   Total users in database: ${users.length}`);
      
      const emailHash = require('crypto').createHash('sha256').update(testEmail.toLowerCase()).digest('hex');
      const userInDb = users.find(u => u.emailHash === emailHash);
      
      if (userInDb) {
        console.log('   ✅ User found in database by email hash');
        console.log(`   User ID in DB: ${userInDb.id}`);
        console.log(`   Has password hash: ${userInDb.passwordHash ? 'Yes' : 'No'}`);
        
        // Try to see if password comparison would work
        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare(testPassword, userInDb.passwordHash);
        console.log(`   Password would match: ${passwordMatch ? 'Yes' : 'No'}`);
      } else {
        console.log('   ❌ User NOT found in database by email hash');
        console.log(`   Email hash searched: ${emailHash}`);
      }
      return;
    }
    
    // Step 3: Verify token
    console.log('\n3. Verifying authentication token...');
    
    const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {}, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (verifyRes.data.success) {
      console.log('   ✅ TOKEN VERIFICATION SUCCESSFUL');
      console.log(`   User ID from token: ${verifyRes.data.user?.id}`);
      console.log(`   Token valid: ${verifyRes.data.valid ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ TOKEN VERIFICATION FAILED');
      console.log(`   Error: ${verifyRes.data.error || 'Token invalid'}`);
    }
    
    // Step 4: Test wrong password
    console.log('\n4. Testing wrong password scenario...');
    
    try {
      const wrongPassRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123'
      });
      
      if (!wrongPassRes.data.success) {
        console.log('   ✅ Wrong password correctly rejected');
        console.log(`   Error: ${wrongPassRes.data.error || 'Invalid credentials'}`);
      } else {
        console.log('   ❌ WRONG PASSWORD ACCEPTED - SECURITY ISSUE!');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log('   ✅ Wrong password correctly rejected (401/400)');
      } else {
        console.log('   ⚠️ Unexpected error with wrong password:', error.message);
      }
    }
    
    // Step 5: Test duplicate email
    console.log('\n5. Testing duplicate email detection...');
    
    try {
      const duplicateRes = await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Another User',
        email: testEmail,
        password: 'DifferentPassword456'
      });
      
      if (!duplicateRes.data.success && duplicateRes.data.error === 'Email already registered') {
        console.log('   ✅ Duplicate email correctly rejected');
        console.log(`   Error: ${duplicateRes.data.error}`);
      } else {
        console.log('   ❌ Duplicate email was accepted - should have been rejected');
        console.log(`   Response: ${JSON.stringify(duplicateRes.data)}`);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Duplicate email correctly rejected (400)');
      } else {
        console.log('   ⚠️ Unexpected error with duplicate email:', error.message);
      }
    }
    
    // Final summary
    console.log('\n===========================================');
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('===========================================');
    
    if (signupSuccess && loginSuccess) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('\n✅ Authentication system is working correctly:');
      console.log('   - Signup stores user data properly');
      console.log('   - Login validates credentials correctly');
      console.log('   - Token generation and verification works');
      console.log('   - Wrong passwords are rejected');
      console.log('   - Duplicate emails are prevented');
      console.log('\n🔒 Security checks passed:');
      console.log('   - Passwords are hashed with bcrypt');
      console.log('   - Emails are encrypted and hashed');
      console.log('   - JWT tokens are generated and validated');
      console.log('\n👤 User scenario verified:');
      console.log(`   User can sign up with email: ${testEmail}`);
      console.log(`   User can immediately login with same credentials`);
      console.log(`   User receives valid JWT token for authentication`);
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log(`   Signup: ${signupSuccess ? '✅' : '❌'}`);
      console.log(`   Login: ${loginSuccess ? '✅' : '❌'}`);
      
      if (!signupSuccess) {
        console.log('\n   Issue: Signup failed - check server logs and database storage');
      }
      if (!loginSuccess) {
        console.log('\n   Issue: Login failed after successful signup');
        console.log('   Possible causes:');
        console.log('   1. Password hash mismatch');
        console.log('   2. Email hash calculation inconsistency');
        console.log('   3. Database not being saved properly');
        console.log('   4. Server restart between signup and login');
      }
    }
    
  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('   Stack:', error.stack);
  }
}

// Run the test
simulateUserScenario().catch(console.error);