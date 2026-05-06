// Test script to check claim data structure
async function testClaimStructure() {
  try {
    const response = await fetch('http://localhost:3000/claims');
    const data = await response.json();
    
    if (!data.success) {
      console.error('Failed to fetch claims');
      return;
    }
    
    const claims = data.claims;
    console.log(`Total claims: ${claims.length}`);
    
    // Find a claim with fraud score
    const fraudClaim = claims.find(c => c.fraudScore > 0 || c.riskScore > 0);
    
    if (fraudClaim) {
      console.log('\nSample fraud claim structure:');
      console.log(JSON.stringify(fraudClaim, null, 2));
      
      console.log('\nRequired fields for ClaimInvestigation modal:');
      console.log('1. id:', fraudClaim.id ? '✓' : '✗');
      console.log('2. userName:', fraudClaim.userName ? '✓' : '✗');
      console.log('3. claimType:', fraudClaim.claimType ? '✓' : '✗');
      console.log('4. amount:', fraudClaim.amount ? '✓' : '✗');
      console.log('5. status:', fraudClaim.status ? '✓' : '✗');
      console.log('6. fraudScore:', fraudClaim.fraudScore !== undefined ? '✓' : '✗');
      console.log('7. fraudFlags:', fraudClaim.fraudFlags ? '✓' : '✗');
      console.log('8. extractedData:', fraudClaim.extractedData ? '✓' : '✗');
      console.log('9. documentUrl:', fraudClaim.documentUrl ? '✓' : '✗');
      console.log('10. submittedDate:', fraudClaim.submittedDate ? '✓' : '✗');
      
      // Check if the claim would appear in fraud alerts
      const status = (fraudClaim.status || '').toUpperCase();
      const fraudScore = fraudClaim.fraudScore || 0;
      const advancedRiskScore = fraudClaim.advancedRiskScore || 0;
      const riskScore = fraudClaim.riskScore || 0;
      const maxRiskScore = Math.max(fraudScore, advancedRiskScore, riskScore);
      
      const excludedStatuses = ['REJECTED', 'DISMISSED', 'APPROVED', 'BLOCKED'];
      const shouldIncludeByScore = maxRiskScore >= 20 && maxRiskScore <= 100;
      const shouldIncludeByStatus = status === 'UNDER_REVIEW' ||
        status === 'FRAUD_ALERT' ||
        status === 'AUTO_REJECT';
      
      const wouldAppear = (shouldIncludeByStatus || shouldIncludeByScore) && !excludedStatuses.includes(status);
      
      console.log('\nWould appear in Fraud Alerts?', wouldAppear ? '✓ YES' : '✗ NO');
      console.log('  - Status:', status);
      console.log('  - Max risk score:', maxRiskScore);
      console.log('  - Should include by score:', shouldIncludeByScore);
      console.log('  - Should include by status:', shouldIncludeByStatus);
      console.log('  - Excluded?', excludedStatuses.includes(status));
    } else {
      console.log('No fraud claims found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testClaimStructure();