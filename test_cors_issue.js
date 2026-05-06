import fetch from 'node-fetch';

async function testCors() {
  console.log('Testing CORS issue...');
  
  // Test 1: Simple request without Origin header (like browser would send)
  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Cors Test User',
        email: 'cors_test_' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    
    console.log('Test 1 - Status:', response.status);
    const data = await response.json();
    console.log('Test 1 - Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('Test 1 - Error:', error.message);
  }
  
  // Test 2: Request with Origin header (like browser would send)
  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        name: 'Cors Test User 2',
        email: 'cors_test_2_' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    
    console.log('\nTest 2 - Status:', response.status);
    const data = await response.json();
    console.log('Test 2 - Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('Test 2 - Error:', error.message);
  }
  
  // Test 3: OPTIONS preflight request
  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('\nTest 3 - OPTIONS Status:', response.status);
    console.log('Test 3 - Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (error) {
    console.log('Test 3 - Error:', error.message);
  }
}

testCors();