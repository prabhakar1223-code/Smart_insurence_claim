import claimController from './controllers/claimController.js';
import fs from 'fs';
import path from 'path';

/**
 * Test script for the AI validation pipeline
 * This script simulates a claim submission and tests all AI services
 */

async function testAIPipeline() {
  console.log('🧪 Testing AI Validation Pipeline...\n');
  
  // Create mock claim data
  const mockClaimData = {
    claimId: 'TEST-CLAIM-001',
    userName: 'Test User',
    userEmail: 'test@example.com',
    claimType: 'vehicle',
    policyId: 'POL-2024-001',
    amount: '50000',
    incidentDate: '2024-01-15',
    description: 'Car accident with front bumper damage',
    vehicleModel: 'Toyota Innova'
  };
  
  // Create mock files (using existing test images if available)
  const imagePath = path.join('..', 'uploads', '1767023776623.jpeg');
  const mockFiles = {
    damageImage: [{
      path: imagePath,
      originalname: 'car_damage.jpg'
    }],
    vehicleImage: [{
      path: imagePath,
      originalname: 'vehicle_image.jpg'
    }],
    documentImage: [{
      path: imagePath,
      originalname: 'insurance_document.jpg'
    }]
  };
  
  console.log('📋 Test Claim Data:');
  console.log(JSON.stringify(mockClaimData, null, 2));
  console.log('\n');
  
  try {
    console.log('🚀 Processing claim with AI validation...');
    const startTime = Date.now();
    
    // Process claim using the controller
    const result = await claimController.processClaim(mockClaimData, mockFiles);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`✅ AI Validation completed in ${processingTime}ms\n`);
    
    // Display results
    console.log('📊 VALIDATION RESULTS:');
    console.log('=====================');
    
    if (result.success) {
      console.log(`✅ Status: ${result.validation?.status || 'UNKNOWN'}`);
      console.log(`✅ Decision: ${result.validation?.decision || 'UNKNOWN'}`);
      console.log(`✅ Confidence: ${result.validation?.confidence || 0}`);
      console.log(`✅ Risk Score: ${result.aiValidations?.risk?.overallScore || 0}`);
      
      // Display damage detection results
      if (result.aiValidations?.damage) {
        console.log('\n🔍 DAMAGE DETECTION:');
        console.log(`   Detected: ${result.aiValidations.damage.detectedDamage || 'UNKNOWN'}`);
        console.log(`   Confidence: ${result.aiValidations.damage.confidence || 0}`);
        console.log(`   Severity: ${result.aiValidations.damage.severity || 'UNKNOWN'}`);
      }
      
      // Display vehicle validation results
      if (result.aiValidations?.vehicle) {
        console.log('\n🚗 VEHICLE VALIDATION:');
        console.log(`   Detected: ${result.aiValidations.vehicle.detection?.detectedVehicle || 'UNKNOWN'}`);
        console.log(`   Match Type: ${result.aiValidations.vehicle.validation?.matchType || 'UNKNOWN'}`);
        console.log(`   Confidence: ${result.aiValidations.vehicle.confidenceLevel || 0}`);
      }
      
      // Display OCR results
      if (result.aiValidations?.document) {
        console.log('\n📄 DOCUMENT OCR:');
        console.log(`   Document Type: ${result.aiValidations.document.documentType || 'UNKNOWN'}`);
        console.log(`   Completeness: ${(result.aiValidations.document.completenessScore * 100).toFixed(1)}%`);
        console.log(`   Validation: ${result.aiValidations.document.validation?.status || 'UNKNOWN'}`);
      }
      
      // Display recommendations
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        result.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority}] ${rec.action} - ${rec.reason}`);
        });
      }
      
      // Display next steps
      if (result.nextSteps && result.nextSteps.length > 0) {
        console.log('\n📋 NEXT STEPS:');
        result.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      }
      
      // Test individual services
      console.log('\n🧪 INDIVIDUAL SERVICE TESTS:');
      console.log('===========================');
      
      await testDamageService();
      await testVehicleService();
      await testOCRService();
      await testRiskService();
      
    } else {
      console.log('❌ AI Validation failed:', result.error);
    }
    
    console.log('\n🎉 AI PIPELINE TEST COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack:', error.stack);
  }
}

async function testDamageService() {
  console.log('\n   🔍 Testing Damage Detection Service...');
  try {
    const { detectDamage } = await import('./services/damageService.js');
    
    // Test with a mock image path
    const testImagePath = path.join('..', 'uploads', '1767023776623.jpeg');
    
    if (fs.existsSync(testImagePath)) {
      const result = await detectDamage(testImagePath);
      console.log(`     ✅ Damage detection: ${result.detectedDamage} (confidence: ${result.confidence})`);
      console.log(`     ✅ Severity: ${result.severity}`);
      
      // Verify critical rule: no_damage → 0-5%
      if (result.detectedDamage === 'no_damage') {
        const damagePercentage = result.damagePercentage || 0;
        if (damagePercentage >= 0 && damagePercentage <= 5) {
          console.log(`     ✅ Critical rule verified: no_damage → ${damagePercentage}% damage`);
        } else {
          console.log(`     ⚠️  Critical rule violation: no_damage but damagePercentage = ${damagePercentage}%`);
        }
      }
      
      // Verify confidence threshold
      if (result.confidence < 0.6) {
        console.log(`     ✅ Confidence threshold: ${result.confidence} < 0.6 → UNCERTAIN`);
      }
    } else {
      console.log(`     ⚠️  Test image not found: ${testImagePath}`);
    }
  } catch (error) {
    console.log(`     ❌ Damage service test failed: ${error.message}`);
  }
}

async function testVehicleService() {
  console.log('\n   🚗 Testing Vehicle Validation Service...');
  try {
    const { detectVehicle, validateVehicle } = await import('./services/vehicleService.js');
    
    // Test with a mock image path
    const testImagePath = path.join('..', 'uploads', '1767023776623.jpeg');
    
    if (fs.existsSync(testImagePath)) {
      const detectionResult = await detectVehicle(testImagePath);
      console.log(`     ✅ Vehicle detection: ${detectionResult.detectedVehicle} (confidence: ${detectionResult.confidence})`);
      
      // Test validation
      const validationResult = validateVehicle(detectionResult, 'Toyota Innova');
      console.log(`     ✅ Vehicle validation: ${validationResult.matchType} (confidence: ${validationResult.confidence})`);
      
      // Verify confidence threshold
      if (validationResult.confidence >= 0.6) {
        console.log(`     ✅ Confidence threshold: ${validationResult.confidence} >= 0.6 → VALID`);
      } else {
        console.log(`     ⚠️  Low confidence: ${validationResult.confidence} < 0.6 → REQUIRES_MANUAL_REVIEW`);
      }
    } else {
      console.log(`     ⚠️  Test image not found: ${testImagePath}`);
    }
  } catch (error) {
    console.log(`     ❌ Vehicle service test failed: ${error.message}`);
  }
}

async function testOCRService() {
  console.log('\n   📄 Testing OCR Service...');
  try {
    const { extractDocumentData } = await import('./services/ocrService.js');
    
    // Test with a mock image path
    const testImagePath = path.join('..', 'uploads', '1767023776623.jpeg');
    
    if (fs.existsSync(testImagePath)) {
      const result = await extractDocumentData(testImagePath, 'vehicle');
      console.log(`     ✅ OCR extraction completed`);
      console.log(`     ✅ Extracted fields: ${Object.keys(result.fields || {}).length} fields`);
      
      if (result.fields) {
        const importantFields = ['policyNumber', 'vehicleNumber', 'date', 'amount'];
        importantFields.forEach(field => {
          if (result.fields[field]) {
            console.log(`       • ${field}: ${result.fields[field]}`);
          }
        });
      }
    } else {
      console.log(`     ⚠️  Test image not found: ${testImagePath}`);
    }
  } catch (error) {
    console.log(`     ❌ OCR service test failed: ${error.message}`);
  }
}

async function testRiskService() {
  console.log('\n   📊 Testing Risk Calculation Service...');
  try {
    const { calculateRiskScore } = await import('./services/riskService.js');
    
    // Create mock risk data
    const mockRiskData = {
      claimData: {
        claimType: 'vehicle',
        amount: '50000',
        incidentDate: '2024-01-15'
      },
      damageDetection: {
        detectedDamage: 'moderate',
        confidence: 0.8,
        severity: 'MODERATE'
      },
      vehicleValidation: {
        validation: {
          matchType: 'EXACT_MATCH',
          confidence: 0.9
        }
      },
      documentExtraction: {
        completenessScore: 0.85,
        validation: {
          status: 'VALID'
        }
      }
    };
    
    const result = await calculateRiskScore(mockRiskData);
    console.log(`     ✅ Risk calculation: ${result.overallScore} (status: ${result.riskStatus})`);
    console.log(`     ✅ Breakdown: ${Object.keys(result.breakdown || {}).length} factors`);
    
    if (result.reasons && result.reasons.length > 0) {
      console.log(`     ✅ Reasons: ${result.reasons.slice(0, 3).join(', ')}`);
    }
  } catch (error) {
    console.log(`     ❌ Risk service test failed: ${error.message}`);
  }
}

// Run the test
testAIPipeline().catch(console.error);