// Test script to verify Reject button functionality
console.log('Testing Reject button functionality...\n');

async function testRejectButton() {
  try {
    // First, get all claims
    const response = await fetch('http://localhost:3000/claims');
    const data = await response.json();
    
    if (!data.success) {
      console.error('Failed to fetch claims');
      return;
    }
    
    const claims = data.claims;
    console.log(`Total claims: ${claims.length}`);
    
    // Find a claim that is in fraud alert (status UNDER_REVIEW or FRAUD_ALERT)
    const fraudClaim = claims.find(c => 
      (c.status === 'UNDER_REVIEW' || c.status === 'FRAUD_ALERT') &&
      !['REJECTED', 'DISMISSED', 'APPROVED'].includes(c.status)
    );
    
    if (!fraudClaim) {
      console.log('No fraud alert claims found. Creating a test claim...');
      // We'll test with the first claim that's not already rejected
      const testClaim = claims.find(c => !['REJECTED', 'DISMISSED', 'APPROVED'].includes(c.status));
      if (!testClaim) {
        console.log('No testable claims found');
        return;
      }
      console.log(`Using claim ID: ${testClaim.id} with status: ${testClaim.status}`);
      
      // Test the update-status endpoint
      const updateResponse = await fetch(`http://localhost:3000/claims/${testClaim.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', markedAsFraud: true })
      });
      
      const updateData = await updateResponse.json();
      console.log('Update response:', updateData);
      
      if (updateData.success) {
        console.log('✓ Reject button backend functionality works');
        
        // Verify the claim was updated
        const verifyResponse = await fetch('http://localhost:3000/claims');
        const verifyData = await verifyResponse.json();
        const updatedClaim = verifyData.claims.find(c => c.id === testClaim.id);
        
        if (updatedClaim.status === 'REJECTED') {
          console.log('✓ Claim status successfully updated to REJECTED');
          console.log('✓ Claim markedAsFraud:', updatedClaim.markedAsFraud);
        } else {
          console.log('✗ Claim status not updated correctly');
        }
      } else {
        console.log('✗ Failed to update claim status');
      }
    } else {
      console.log(`Found fraud alert claim: ID=${fraudClaim.id}, status=${fraudClaim.status}`);
      console.log('Testing reject functionality...');
      
      const updateResponse = await fetch(`http://localhost:3000/claims/${fraudClaim.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', markedAsFraud: true })
      });
      
      const updateData = await updateResponse.json();
      console.log('Update response:', updateData);
      
      if (updateData.success) {
        console.log('✓ Reject button backend functionality works');
      } else {
        console.log('✗ Failed to update claim status');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRejectButton();