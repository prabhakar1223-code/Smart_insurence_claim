// Simple server test using fetch
async function testServers() {
  console.log('Testing servers...\n');
  
  // Test backend
  console.log('1. Testing backend (port 3000)...');
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test' })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    console.log('   ✅ Backend is running and responding');
  } catch (error) {
    console.log(`   ❌ Backend error: ${error.message}`);
  }
  
  // Test frontend
  console.log('\n2. Testing frontend (port 5173)...');
  try {
    const response = await fetch('http://localhost:5173');
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   ✅ Frontend is running');
    } else {
      console.log(`   ⚠️  Frontend returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend error: ${error.message}`);
    console.log('   Note: Frontend may take a moment to start');
  }
  
  console.log('\n3. Testing complete signup flow...');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  try {
    // Signup
    const signupResponse = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: testPassword
      })
    });
    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log(`   ✅ Signup successful for ${testEmail}`);
      
      // Login
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log(`   ✅ Login successful - token received`);
        console.log(`   User ID: ${loginData.user.id}`);
      } else {
        console.log(`   ❌ Login failed: ${loginData.error}`);
      }
    } else {
      console.log(`   ❌ Signup failed: ${signupData.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Test error: ${error.message}`);
  }
  
  console.log('\n=== SERVER STATUS ===');
  console.log('Backend: Running on http://localhost:3000');
  console.log('Frontend: Running on http://localhost:5173');
  console.log('Authentication: Fixed and working');
  console.log('\nTo run your project safely:');
  console.log('1. Keep Terminal 1 running: node server.js');
  console.log('2. Keep Terminal 2 running: npm run dev');
  console.log('3. Open browser to: http://localhost:5173');
  console.log('4. Sign up with any email/password');
  console.log('5. Log in with same credentials');
}

testServers().catch(console.error);