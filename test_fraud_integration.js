// Integration test for fraud alert routing with new thresholds
console.log('=== Testing Fraud Alert Routing Integration ===\n');

// Simulate the updated generateValidationDecision function
function generateValidationDecision(overallScore) {
  let decision, confidence, routingPriority;
  
  if (overallScore < 25) {
    decision = 'AUTO_APPROVE';
    confidence = 0.95;
    routingPriority = 'IMMEDIATE';
  } else if (overallScore <= 75) {
    decision = 'FRAUD_INVESTIGATION';
    confidence = 0.60;
    routingPriority = 'HIGH';
  } else {
    decision = 'AUTO_REJECT';
    confidence = 0.30;
    routingPriority = 'CRITICAL';
  }
  
  return {
    status: 'COMPLETED',
    decision,
    confidence,
    routingPriority,
    riskScore: overallScore,
    decisionThresholds: {
      autoApprove: 25,
      fraudInvestigation: 75,
      autoReject: 76
    }
  };
}

// Simulate the status mapping from server.js
function mapToFinalStatus(decision) {
  if (decision === 'AUTO_APPROVE') return 'APPROVED';
  if (decision === 'AUTO_REJECT') return 'REJECTED';
  if (decision === 'FRAUD_INVESTIGATION') return 'FRAUD_ALERT';
  return 'MANUAL_REVIEW';
}

// Test cases
const testCases = [
  { score: 10, expectedDecision: 'AUTO_APPROVE', expectedStatus: 'APPROVED', description: 'Low risk (<25) should auto approve' },
  { score: 24, expectedDecision: 'AUTO_APPROVE', expectedStatus: 'APPROVED', description: 'Borderline low risk (24) should auto approve' },
  { score: 25, expectedDecision: 'FRAUD_INVESTIGATION', expectedStatus: 'FRAUD_ALERT', description: 'Threshold (25) should go to fraud alert' },
  { score: 50, expectedDecision: 'FRAUD_INVESTIGATION', expectedStatus: 'FRAUD_ALERT', description: 'Medium risk (50) should go to fraud alert' },
  { score: 75, expectedDecision: 'FRAUD_INVESTIGATION', expectedStatus: 'FRAUD_ALERT', description: 'Upper threshold (75) should go to fraud alert' },
  { score: 76, expectedDecision: 'AUTO_REJECT', expectedStatus: 'REJECTED', description: 'High risk (76) should auto reject' },
  { score: 90, expectedDecision: 'AUTO_REJECT', expectedStatus: 'REJECTED', description: 'Very high risk (90) should auto reject' },
];

console.log('Testing claim decision routing:\n');
let passed = 0;
testCases.forEach((test, index) => {
  const result = generateValidationDecision(test.score);
  const finalStatus = mapToFinalStatus(result.decision);
  
  const decisionPass = result.decision === test.expectedDecision;
  const statusPass = finalStatus === test.expectedStatus;
  const testPass = decisionPass && statusPass;
  
  if (testPass) passed++;
  
  console.log(`Test ${index + 1}: ${test.description}`);
  console.log(`  Score: ${test.score} → Decision: ${result.decision} (expected: ${test.expectedDecision}) ${decisionPass ? '✓' : '✗'}`);
  console.log(`  Final Status: ${finalStatus} (expected: ${test.expectedStatus}) ${statusPass ? '✓' : '✗'}`);
  console.log(`  ${testPass ? 'PASS' : 'FAIL'}\n`);
});

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}/${testCases.length} tests`);

// Test FraudAlerts filtering logic
console.log('\n=== Testing FraudAlerts Filtering ===\n');

function simulateFraudAlertsFiltering(claims) {
  return claims.filter((c) => {
    const status = (c.status || '').toUpperCase();
    const maxRiskScore = c.fraudScore || 0;
    
    const excludedStatuses = ['REJECTED', 'DISMISSED', 'APPROVED', 'BLOCKED'];
    
    const shouldIncludeByScore = maxRiskScore >= 25 && maxRiskScore <= 100;
    const shouldIncludeByStatus = status === 'FRAUD_ALERT' || status === 'AUTO_REJECT';
    
    return (shouldIncludeByStatus || shouldIncludeByScore) && !excludedStatuses.includes(status);
  });
}

const testClaims = [
  { id: 'TEST-1', fraudScore: 10, status: 'APPROVED' },
  { id: 'TEST-2', fraudScore: 24, status: 'APPROVED' },
  { id: 'TEST-3', fraudScore: 25, status: 'FRAUD_ALERT' },
  { id: 'TEST-4', fraudScore: 50, status: 'FRAUD_ALERT' },
  { id: 'TEST-5', fraudScore: 75, status: 'FRAUD_ALERT' },
  { id: 'TEST-6', fraudScore: 76, status: 'REJECTED' },
  { id: 'TEST-7', fraudScore: 90, status: 'AUTO_REJECT' },
  { id: 'TEST-8', fraudScore: 30, status: 'DISMISSED' },
];

const filtered = simulateFraudAlertsFiltering(testClaims);
console.log(`Total claims: ${testClaims.length}`);
console.log(`Claims in fraud alerts: ${filtered.length}`);
console.log('Included claim IDs:', filtered.map(c => c.id).join(', '));

// Verify expected filtering
const expectedIncluded = ['TEST-3', 'TEST-4', 'TEST-5', 'TEST-7'];
const actualIncluded = filtered.map(c => c.id);
const allIncluded = expectedIncluded.every(id => actualIncluded.includes(id)) && 
                    actualIncluded.length === expectedIncluded.length;

console.log(`\nFiltering test: ${allIncluded ? 'PASS ✓' : 'FAIL ✗'}`);
if (!allIncluded) {
  console.log('Expected:', expectedIncluded);
  console.log('Actual:', actualIncluded);
}

console.log('\n=== All Tests Completed ===');