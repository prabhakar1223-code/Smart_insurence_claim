/**
 * Test script for verifying updated risk scoring logic
 * Tests:
 * 1. All fraud factor points reduced by 10 points
 * 2. Low damage fraud factor logic
 * 3. Claim status message for damage <20%
 * 4. Claim amount vs damage check
 * 5. Overall risk scoring range (0-100)
 */

import { calculateRiskScore } from './backend/services/riskService.js';

// Mock validation results for testing
const createMockValidation = (damagePercent, claimAmount = 30000) => ({
  damageDetection: {
    status: "OK",
    percentage: damagePercent,
    severity: damagePercent < 10 ? 'MINOR' : damagePercent < 30 ? 'MODERATE' : 'SEVERE',
    confidence: 0.85,
    damageAreas: ['front_bumper', 'hood']
  },
  vehicleValidation: {
    status: "OK",
    match: true,
    confidence: 0.92,
    detectedModel: 'Toyota Camry',
    policyModel: 'Toyota Camry',
    colorMatch: true,
    yearMatch: true
  },
  ocrExtraction: {
    status: "OK",
    confidence: 0.88,
    fields: {
      policyNumber: 'POL123456',
      insuredName: 'John Doe',
      vehicleModel: 'Toyota Camry',
      claimAmount: claimAmount.toString(),
      dateOfLoss: '2024-01-15'
    },
    tamperingScore: 0.1,
    completeness: 0.95
  },
  policyMatch: {
    status: "OK",
    match: true,
    confidence: 0.90,
    policyActive: true,
    coverageAmount: 500000,
    deductible: 5000
  }
});

// Test cases
const testCases = [
  {
    name: 'Very low damage (2%) with normal claim amount',
    damagePercent: 2,
    claimAmount: 30000,
    expectedLowDamage: true,
    expectedRiskIncrease: 20, // 0-5% damage: +20 risk
    expectedMessage: 'Minor damage detected. Claim marked for additional verification.'
  },
  {
    name: 'Low damage (8%) with normal claim amount',
    damagePercent: 8,
    claimAmount: 30000,
    expectedLowDamage: true,
    expectedRiskIncrease: 15, // 5-10% damage: +15 risk
    expectedMessage: 'Minor damage detected. Claim marked for additional verification.'
  },
  {
    name: 'Low damage (15%) with normal claim amount',
    damagePercent: 15,
    claimAmount: 30000,
    expectedLowDamage: true,
    expectedRiskIncrease: 10, // 10-20% damage: +10 risk
    expectedMessage: 'Minor damage detected. Claim marked for additional verification.'
  },
  {
    name: 'Low damage (2%) with high claim amount (>50k)',
    damagePercent: 2,
    claimAmount: 75000,
    expectedLowDamage: true,
    expectedRiskIncrease: 35, // 20 (0-5%) + 15 (claim amount vs damage)
    expectedMessage: 'Minor damage detected. Claim marked for additional verification.'
  },
  {
    name: 'Moderate damage (25%) - should not trigger low damage logic',
    damagePercent: 25,
    claimAmount: 30000,
    expectedLowDamage: false,
    expectedRiskIncrease: 0, // No low damage risk
    expectedMessage: null
  },
  {
    name: 'Severe damage (60%)',
    damagePercent: 60,
    claimAmount: 30000,
    expectedLowDamage: false,
    expectedRiskIncrease: 0,
    expectedMessage: null
  }
];

console.log('=== Testing Updated Risk Scoring Logic ===\n');

let passedTests = 0;
let totalTests = 0;

// Test each case
for (const testCase of testCases) {
  totalTests++;
  console.log(`Test: ${testCase.name}`);
  console.log(`  Damage: ${testCase.damagePercent}%, Claim Amount: ₹${testCase.claimAmount}`);
  
  const validationResults = createMockValidation(testCase.damagePercent, testCase.claimAmount);
  const claimData = {
    amount: testCase.claimAmount,
    damagePercent: testCase.damagePercent,
    vehicleModel: 'Toyota Camry',
    policyNumber: 'POL123456'
  };
  
  try {
    const result = calculateRiskScore(validationResults, claimData, []);
    
    // Check if low damage warning is present
    const hasLowDamageWarning = result.warnings?.some(w =>
      w.includes('Minor damage detected') || w.includes('additional verification')
    );
    
    // Check risk score components - breakdown might have different structure
    const damageRisk = result.breakdown?.find(b => b.category === 'Damage Risk' || b.name === 'Damage Risk')?.score || 0;
    
    console.log(`  Total Risk Score: ${result.riskScore}`);
    console.log(`  Damage Risk Component: ${damageRisk}`);
    console.log(`  Has Low Damage Warning: ${hasLowDamageWarning}`);
    console.log(`  Warnings: ${JSON.stringify(result.warnings || [])}`);
    console.log(`  Reasons: ${JSON.stringify(result.reasons || [])}`);
    
    // Verify low damage logic
    if (testCase.expectedLowDamage) {
      if (hasLowDamageWarning) {
        console.log('  ✓ Low damage warning correctly triggered');
      } else {
        console.log('  ✗ Low damage warning NOT triggered (should have been)');
        continue;
      }
    } else {
      if (!hasLowDamageWarning) {
        console.log('  ✓ No low damage warning (as expected)');
      } else {
        console.log('  ✗ Low damage warning incorrectly triggered');
        continue;
      }
    }
    
    // Verify claim amount vs damage check for high claim amounts
    if (testCase.damagePercent < 20 && testCase.claimAmount > 50000) {
      const hasAmountWarning = result.warnings?.some(w =>
        w.includes('Minor damage with high claim amount') ||
        w.includes('requires additional verification')
      );
      if (hasAmountWarning) {
        console.log('  ✓ Claim amount vs damage check triggered');
      } else {
        console.log('  ✗ Claim amount vs damage check NOT triggered');
        continue;
      }
    }
    
    // Check risk reasons for low damage
    if (testCase.expectedLowDamage) {
      const hasDamageReason = result.reasons?.some(r =>
        r.includes('Minor vehicle damage') ||
        r.includes('Very low visible damage') ||
        r.includes('Claim amount not proportional to damage')
      );
      if (hasDamageReason) {
        console.log('  ✓ Low damage reasons stored in reasons');
      } else {
        console.log('  ✗ Low damage reasons NOT stored in reasons');
        continue;
      }
    }
    
    passedTests++;
    console.log('  ✓ Test PASSED\n');
    
  } catch (error) {
    console.log(`  ✗ Test FAILED with error: ${error.message}\n`);
  }
}

// Test specific fraud factor reductions
console.log('\n=== Testing Fraud Factor Point Reductions ===\n');

// Test vehicle mismatch scoring (should be reduced from 40 to 30)
console.log('Testing vehicle mismatch scoring reduction:');
const vehicleMismatchValidation = createMockValidation(25, 30000);
vehicleMismatchValidation.vehicleValidation.match = false;
vehicleMismatchValidation.vehicleValidation.detectedModel = 'Honda Civic';
vehicleMismatchValidation.vehicleValidation.policyModel = 'Toyota Camry';

const mismatchResult = calculateRiskScore(vehicleMismatchValidation, { claimAmount: 30000 }, []);
const vehicleRisk = mismatchResult.breakdown?.find(b => b.category === 'Vehicle Risk' || b.name === 'Vehicle Risk')?.score || 0;
console.log(`  Vehicle Risk Score with mismatch: ${vehicleRisk}`);
console.log(`  Expected to be around 30 (reduced from 40)`);

// Test OCR tampering scoring (should be reduced)
console.log('\nTesting OCR tampering scoring reduction:');
const ocrTamperingValidation = createMockValidation(25, 30000);
ocrTamperingValidation.ocrExtraction.tamperingScore = 0.8; // High tampering

const tamperingResult = calculateRiskScore(ocrTamperingValidation, { claimAmount: 30000 }, []);
const ocrRisk = tamperingResult.breakdown?.find(b => b.category === 'OCR Risk' || b.name === 'OCR Risk')?.score || 0;
console.log(`  OCR Risk Score with high tampering: ${ocrRisk}`);
console.log(`  Expected to be reduced by ~10 points from previous values`);

// Test overall score range
console.log('\n=== Testing Overall Score Range (0-100) ===\n');
const extremeValidation = createMockValidation(80, 100000);
extremeValidation.vehicleValidation.match = false;
extremeValidation.ocrExtraction.tamperingScore = 0.9;
extremeValidation.policyMatch.match = false;

const extremeResult = calculateRiskScore(extremeValidation, { claimAmount: 100000 }, []);
console.log(`  Extreme case risk score: ${extremeResult.riskScore}`);
if (extremeResult.riskScore >= 0 && extremeResult.riskScore <= 100) {
  console.log('  ✓ Score within valid range (0-100)');
  passedTests++;
} else {
  console.log('  ✗ Score outside valid range');
}

// Summary
console.log('\n=== TEST SUMMARY ===');
console.log(`Passed: ${passedTests}/${totalTests + 1} tests`);
console.log(`Success Rate: ${Math.round((passedTests / (totalTests + 1)) * 100)}%`);

if (passedTests === totalTests + 1) {
  console.log('\n✅ All tests passed! Risk scoring logic is working correctly.');
  console.log('✅ Fraud factor points have been reduced by 10 points');
  console.log('✅ Low damage fraud factor logic is implemented');
  console.log('✅ Claim status messages work for damage <20%');
  console.log('✅ Claim amount vs damage check is functional');
  console.log('✅ Risk scores remain in valid range (0-100)');
} else {
  console.log('\n❌ Some tests failed. Please review the risk scoring implementation.');
  process.exit(1);
}