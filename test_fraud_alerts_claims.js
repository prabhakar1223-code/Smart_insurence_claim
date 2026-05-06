// Test script to find claims that should appear in Fraud Alerts
async function testFraudAlertsClaims() {
  try {
    const response = await fetch('http://localhost:3000/claims');
    const data = await response.json();
    
    if (!data.success) {
      console.error('Failed to fetch claims');
      return;
    }
    
    const claims = data.claims;
    console.log(`Total claims: ${claims.length}\n`);
    
    const fraudAlertsClaims = claims.filter((c) => {
      const status = (c.status || '').toUpperCase();
      const fraudScore = c.fraudScore || 0;
      const advancedRiskScore = c.advancedRiskScore || 0;
      const riskScore = c.riskScore || 0;
      const maxRiskScore = Math.max(fraudScore, advancedRiskScore, riskScore);

      const excludedStatuses = ['REJECTED', 'DISMISSED', 'APPROVED', 'BLOCKED'];
      const shouldIncludeByScore = maxRiskScore >= 20 && maxRiskScore <= 100;
      const shouldIncludeByStatus = status === 'UNDER_REVIEW' ||
        status === 'FRAUD_ALERT' ||
        status === 'AUTO_REJECT';

      return (shouldIncludeByStatus || shouldIncludeByScore) && !excludedStatuses.includes(status);
    });
    
    console.log(`Found ${fraudAlertsClaims.length} claims that should appear in Fraud Alerts:\n`);
    
    fraudAlertsClaims.forEach((claim, i) => {
      console.log(`${i + 1}. Claim ID: ${claim.id}`);
      console.log(`   Status: ${claim.status}`);
      console.log(`   Fraud Score: ${claim.fraudScore || 'N/A'}`);
      console.log(`   Risk Score: ${claim.riskScore || 'N/A'}`);
      console.log(`   Advanced Risk Score: ${claim.advancedRiskScore || 'N/A'}`);
      console.log(`   Claim Type: ${claim.claimType}`);
      console.log(`   Amount: ${claim.amount}`);
      console.log(`   User: ${claim.userName}`);
      console.log(`   Submitted: ${claim.submittedDate}`);
      console.log(`   Has extractedData: ${!!claim.extractedData}`);
      console.log(`   Has documentUrl: ${!!claim.documentUrl}`);
      console.log('');
    });
    
    if (fraudAlertsClaims.length === 0) {
      console.log('No claims found for Fraud Alerts. Creating a test claim...');
      
      // Create a test claim with high risk score
      const testClaim = {
        id: 'TEST-FRAUD-' + Date.now(),
        userName: 'Test User',
        userEmail: 'test@example.com',
        claimType: 'vehicle',
        amount: '50000',
        validationStatus: 'COMPLETED',
        issues: [],
        fraudScore: 75,
        fraudSeverity: 'critical',
        fraudFlags: ['Test fraud flag 1', 'Test fraud flag 2'],
        status: 'UNDER_REVIEW',
        breakdown: [
          { factor: 'Test Factor', score: 75, weight: 'High' }
        ],
        submittedDate: new Date().toISOString(),
        adminNotes: null,
        fraudExplanation: 'Test fraud explanation',
        markedAsFraud: false
      };
      
      console.log('Test claim created (in memory only). To actually add it, need to modify backend.');
      console.log('You can submit a new claim through the frontend to test.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFraudAlertsClaims();