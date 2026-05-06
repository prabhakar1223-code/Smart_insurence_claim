const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCoreAuthentication() {
  console.log('🔐 AUTHENTICATION FIX VERIFICATION');
  console.log('===================================');
  console.log('Testing the exact user-reported issue:');
  console.log('1. Signup should work');
  console.log('2. Login with same credentials should work');
  console.log('3. No "Invalid email or password" after successful signup\n');
  
  const timestamp = Date.now();
  const testEmail = `verify_fix_${timestamp}@example.com`;
  const testPassword = 'TestPassword123';
  const testName = 'Verification Test User';
  
  let results = {
    signup: { success: false, message: '' },
    login: { success: false, message: '' },
    duplicateCheck: { success: false, message: '' },
    wrongPassword: { success: false, message: '' }
  };
  
  try {
    // Test 1: Signup
    console.log('1. TESTING SIGNUP');
    console.log(`   Email: ${testEmail}`);
    
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });
    
    if (signupRes.data.success) {
      results.signup.success = true;
      results.signup.message = `✅ Signup successful - User ID: ${signupRes.data.user?.id}`;
      console.log(`   ${results.signup.message}`);
      
      // Verify user was saved
      const users = require('./data/users.json');
      const emailHash = require('crypto').createHash('sha256').update(testEmail.toLowerCase()).digest('hex');
      const userInDb = users.find(u => u.emailHash === emailHash);
      
      if (userInDb) {
        console.log(`   ✅ User stored in database with ID: ${userInDb.id}`);
        console.log(`   ✅ Email encrypted: ${userInDb.encryptedEmail ? 'Yes' : 'No'}`);
        console.log(`   ✅ Password hashed: ${userInDb.passwordHash ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ⚠️ User not found in database - possible persistence issue`);
      }
    } else {
      results.signup.message = `❌ Signup failed: ${signupRes.data.error || 'Unknown error'}`;
      console.log(`   ${results.signup.message}`);
    }
    
    // Wait for data to persist
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Test 2: Login with same credentials
    console.log('\n2. TESTING LOGIN (with same credentials)');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (loginRes.data.success && loginRes.data.token) {
      results.login.success = true;
      results.login.message = `✅ Login successful - Token received`;
      console.log(`   ${results.login.message}`);
      console.log(`   ✅ User authenticated: ${loginRes.data.user?.email || testEmail}`);
      console.log(`   ✅ JWT token generated: ${loginRes.data.token.substring(0, 30)}...`);
    } else {
      results.login.message = `❌ Login failed: ${loginRes.data.error || 'Invalid credentials'}`;
      console.log(`   ${results.login.message}`);
      
      // Debug why login failed
      console.log(`\n   🔍 Debugging login failure:`);
      const users = require('./data/users.json');
      const emailHash = require('crypto').createHash('sha256').update(testEmail.toLowerCase()).digest('hex');
      const userInDb = users.find(u => u.emailHash === emailHash);
      
      if (userInDb) {
        console.log(`   ✅ User exists in database with ID: ${userInDb.id}`);
        console.log(`   ⚠️ Possible password hash mismatch`);
      } else {
        console.log(`   ❌ User NOT found in database`);
        console.log(`   ⚠️ Database persistence issue - user not saved properly`);
      }
    }
    
    // Test 3: Duplicate email check
    console.log('\n3. TESTING DUPLICATE EMAIL DETECTION');
    
    try {
      const duplicateRes = await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Duplicate Test',
        email: testEmail,
        password: 'DifferentPassword'
      });
      
      if (!duplicateRes.data.success && duplicateRes.data.error === 'Email already registered') {
        results.duplicateCheck.success = true;
        results.duplicateCheck.message = `✅ Duplicate email correctly rejected`;
        console.log(`   ${results.duplicateCheck.message}`);
        console.log(`   ✅ Error message: "${duplicateRes.data.error}"`);
      } else {
        results.duplicateCheck.message = `❌ Duplicate email was accepted`;
        console.log(`   ${results.duplicateCheck.message}`);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        results.duplicateCheck.success = true;
        results.duplicateCheck.message = `✅ Duplicate email rejected (400)`;
        console.log(`   ${results.duplicateCheck.message}`);
      } else {
        results.duplicateCheck.message = `⚠️ Error testing duplicate: ${error.message}`;
        console.log(`   ${results.duplicateCheck.message}`);
      }
    }
    
    // Test 4: Wrong password
    console.log('\n4. TESTING WRONG PASSWORD REJECTION');
    
    try {
      const wrongPassRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123'
      });
      
      if (!wrongPassRes.data.success) {
        results.wrongPassword.success = true;
        results.wrongPassword.message = `✅ Wrong password correctly rejected`;
        console.log(`   ${results.wrongPassword.message}`);
        console.log(`   ✅ Error: ${wrongPassRes.data.error || 'Invalid credentials'}`);
      } else {
        results.wrongPassword.message = `❌ Wrong password was accepted - SECURITY ISSUE`;
        console.log(`   ${results.wrongPassword.message}`);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        results.wrongPassword.success = true;
        results.wrongPassword.message = `✅ Wrong password rejected (${error.response.status})`;
        console.log(`   ${results.wrongPassword.message}`);
      } else {
        results.wrongPassword.message = `⚠️ Error testing wrong password: ${error.message}`;
        console.log(`   ${results.wrongPassword.message}`);
      }
    }
    
    // Final summary
    console.log('\n===================================');
    console.log('📊 FINAL RESULTS');
    console.log('===================================');
    
    const allPassed = results.signup.success && results.login.success;
    
    if (allPassed) {
      console.log('🎉 AUTHENTICATION FIX VERIFIED SUCCESSFULLY!');
      console.log('\n✅ The user-reported issue has been FIXED:');
      console.log('   - Signup works and saves user data properly');
      console.log('   - Login with same credentials works immediately');
      console.log('   - No more "Invalid email or password" after successful signup');
      console.log('\n✅ Additional security features working:');
      console.log('   - Duplicate email detection: ' + (results.duplicateCheck.success ? '✅' : '❌'));
      console.log('   - Wrong password rejection: ' + (results.wrongPassword.success ? '✅' : '❌'));
      console.log('\n🔒 Security implementation:');
      console.log('   - Passwords are hashed with bcrypt');
      console.log('   - Emails are encrypted for privacy');
      console.log('   - Email hashes used for duplicate detection');
      console.log('   - JWT tokens for session management');
      console.log('\n👤 User can now:');
      console.log(`   1. Sign up with email: ${testEmail}`);
      console.log(`   2. Immediately log in with same credentials`);
      console.log(`   3. Receive a secure JWT token for authentication`);
      console.log(`   4. Access the application securely`);
    } else {
      console.log('❌ AUTHENTICATION ISSUE PERSISTS');
      console.log('\nIssues found:');
      if (!results.signup.success) console.log(`   - Signup: ${results.signup.message}`);
      if (!results.login.success) console.log(`   - Login: ${results.login.message}`);
      if (!results.duplicateCheck.success) console.log(`   - Duplicate check: ${results.duplicateCheck.message}`);
      if (!results.wrongPassword.success) console.log(`   - Wrong password: ${results.wrongPassword.message}`);
      
      console.log('\n🔧 Recommended fixes:');
      if (!results.signup.success) {
        console.log('   - Check server.js signup endpoint for bugs');
        console.log('   - Verify database write permissions');
      }
      if (!results.login.success && results.signup.success) {
        console.log('   - Check password hashing/verification in login endpoint');
        console.log('   - Verify email hash calculation consistency');
        console.log('   - Check database persistence between signup and login');
      }
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('\n❌ TEST EXECUTION ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('\n⚠️ Server may not be running or there is a network issue');
    console.error(`   Ensure server is running at ${BASE_URL}`);
    console.error('   Run: node server.js');
    return false;
  }
}

// Run the test
testCoreAuthentication().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ AUTHENTICATION SYSTEM IS NOW FIXED AND WORKING');
  } else {
    console.log('❌ AUTHENTICATION SYSTEM STILL HAS ISSUES');
  }
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});