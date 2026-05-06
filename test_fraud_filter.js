// Test script to verify fraud alert filtering logic with new thresholds
const testClaims = [
  { id: 'CLM-001', fraudScore: 10, status: 'APPROVED' },
  { id: 'CLM-002', fraudScore: 24, status: 'AUTO_APPROVE' },
  { id: 'CLM-003', fraudScore: 25, status: 'FRAUD_ALERT' },
  { id: 'CLM-004', fraudScore: 50, status: 'FRAUD_ALERT' },
  { id: 'CLM-005', fraudScore: 75, status: 'FRAUD_ALERT' },
  { id: 'CLM-006', fraudScore: 76, status: 'REJECTED' },
  { id: 'CLM-007', fraudScore: 90, status: 'AUTO_REJECT' },
  { id: 'CLM-008', fraudScore: 0, status: 'REJECTED' },
  { id: 'CLM-009', fraudScore: 30, status: 'DISMISSED' },
  { id: 'CLM-010', fraudScore: 70, status: 'FRAUD_ALERT' },
];

// Simulate the filtering logic from FraudAlerts.tsx (updated for new thresholds)
function getMaxRiskScore(claim) {
  const fraudScore = claim.fraudScore || 0;
  const advancedRiskScore = claim.advancedRiskScore || 0;
  const riskScore = claim.riskScore || 0;
  return Math.max(fraudScore, advancedRiskScore, riskScore);
}

function shouldIncludeClaim(claim) {
  const status = (claim.status || '').toUpperCase();
  const maxRiskScore = getMaxRiskScore(claim);
  
  const excludedStatuses = ['REJECTED', 'DISMISSED', 'APPROVED', 'BLOCKED'];
  
  // NEW THRESHOLDS: Include if status is FRAUD_ALERT OR risk score is between 25-100
  // 0-24: AUTO_APPROVE (exclude), 25-75: FRAUD_ALERT (include), 76-100: AUTO_REJECT (include)
  const shouldIncludeByScore = maxRiskScore >= 25 && maxRiskScore <= 100;
  const shouldIncludeByStatus = status === 'FRAUD_ALERT' || 
                               status === 'AUTO_REJECT';
  
  return (shouldIncludeByStatus || shouldIncludeByScore) && !excludedStatuses.includes(status);
}

// Test the filtering
console.log('Testing fraud alert filtering logic with NEW thresholds:\n');
console.log('Expected results with new thresholds (25-75 fraud alert, >75 auto reject, <25 auto approve):');
console.log('- CLM-001 (score 10): Should NOT appear (score < 25, status APPROVED)');
console.log('- CLM-002 (score 24): Should NOT appear (score < 25, status AUTO_APPROVE)');
console.log('- CLM-003 (score 25): Should appear (score >= 25, status FRAUD_ALERT)');
console.log('- CLM-004 (score 50): Should appear (score 25-75, status FRAUD_ALERT)');
console.log('- CLM-005 (score 75): Should appear (score 25-75, status FRAUD_ALERT)');
console.log('- CLM-006 (score 76): Should NOT appear (excluded status REJECTED)');
console.log('- CLM-007 (score 90): Should appear (score > 75, status AUTO_REJECT)');
console.log('- CLM-008 (score 0): Should NOT appear (excluded status REJECTED)');
console.log('- CLM-009 (score 30): Should NOT appear (excluded status DISMISSED)');
console.log('- CLM-010 (score 70): Should appear (status FRAUD_ALERT)');

console.log('\nActual results:');
testClaims.forEach(claim => {
  const included = shouldIncludeClaim(claim);
  console.log(`- ${claim.id} (score ${claim.fraudScore}, status ${claim.status}): ${included ? 'INCLUDED ✓' : 'EXCLUDED ✗'}`);
});

const includedClaims = testClaims.filter(shouldIncludeClaim);
console.log(`\nTotal included claims: ${includedClaims.length} out of ${testClaims.length}`);

console.log('\nTest verification:');
const tests = [
  { claim: testClaims[0], shouldBeIncluded: false, reason: 'score < 25' },
  { claim: testClaims[1], shouldBeIncluded: false, reason: 'score < 25' },
  { claim: testClaims[2], shouldBeIncluded: true, reason: 'score >= 25' },
  { claim: testClaims[3], shouldBeIncluded: true, reason: 'score 25-75' },
  { claim: testClaims[4], shouldBeIncluded: true, reason: 'score 25-75' },
  { claim: testClaims[5], shouldBeIncluded: false, reason: 'REJECTED status' },
  { claim: testClaims[6], shouldBeIncluded: true, reason: 'score > 75, status AUTO_REJECT' },
  { claim: testClaims[7], shouldBeIncluded: false, reason: 'REJECTED status' },
  { claim: testClaims[8], shouldBeIncluded: false, reason: 'DISMISSED status' },
  { claim: testClaims[9], shouldBeIncluded: true, reason: 'FRAUD_ALERT status' },
];

let passed = 0;
tests.forEach((test, i) => {
  const actual = shouldIncludeClaim(test.claim);
  const expected = test.shouldBeIncluded;
  const passedTest = actual === expected;
  if (passedTest) passed++;
  console.log(`${passedTest ? '✓' : '✗'} ${test.claim.id} should be ${test.shouldBeIncluded ? 'included' : 'excluded'} (${test.reason})`);
});

console.log(`\n${passed}/${tests.length} tests passed`);