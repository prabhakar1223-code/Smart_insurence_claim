// Test script to check if /process-claim endpoint works

async function testEndpoint() {
  console.log('Testing /process-claim endpoint...');
  
  try {
    // First, let's test if server is reachable
    const healthCheck = await fetch('http://localhost:3000/');
    console.log(`Server reachable: ${healthCheck.status} ${healthCheck.statusText}`);
  } catch (error) {
    console.error('Cannot reach server:', error.message);
    return;
  }
  
  // Test with a simple POST request (without files)
  // Since we can't easily create FormData in Node without libraries,
  // let's test with a JSON payload instead
  const testData = {
    claimType: 'vehicle',
    amount: 5000,
    userName: 'Test User',
    userEmail: 'test@example.com'
  };
  
  try {
    // Try the /submit-claim endpoint which accepts JSON
    const response = await fetch('http://localhost:3000/submit-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`/submit-claim Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success! Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 200));
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testEndpoint();