// Test frontend authentication connectivity
async function testFrontendAuth() {
  console.log('Testing frontend authentication connectivity...\n');
  
  // Test 1: Simple GET request to check if server is accessible
  try {
    const response = await fetch('http://localhost:3000/');
    console.log(`Test 1 - Server root: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`Test 1 - Server root: ERROR - ${error.message}`);
  }
  
  // Test 2: Test signup endpoint with fetch (simulating frontend)
  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Frontend Test User',
        email: 'frontend-test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log(`Test 2 - Signup endpoint: ${response.status} ${response.statusText}`);
    console.log(`  Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`Test 2 - Signup endpoint: ERROR - ${error.message}`);
  }
  
  // Test 3: Test login endpoint with fetch
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'frontend-test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log(`Test 3 - Login endpoint: ${response.status} ${response.statusText}`);
    console.log(`  Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`Test 3 - Login endpoint: ERROR - ${error.message}`);
  }
  
  // Test 4: Test with credentials (cookies)
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        email: 'frontend-test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log(`Test 4 - Login with credentials: ${response.status} ${response.statusText}`);
    console.log(`  Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`Test 4 - Login with credentials: ERROR - ${error.message}`);
  }
  
  console.log('\n=== Testing complete ===');
}

// Run the test
testFrontendAuth().catch(console.error);