// Risk Calculation Service
// Integrates AI validation results to calculate comprehensive risk scores

/**
 * Calculate risk score based on AI validation results
 * @param {Object} validationResults - Results from damage, vehicle, and OCR validation
 * @param {Object} claimData - Original claim data
 * @param {Array} userHistory - User's past claims
 * @returns {Object} Risk assessment with score, status, and detailed breakdown
 */
export function calculateRiskScore(validationResults, claimData, userHistory = []) {
  let riskScore = 0;
  const reasons = [];
  const breakdown = [];
  const warnings = [];
  
  const {
    damageDetection,
    vehicleValidation,
    ocrExtraction,
    policyMatch
  } = validationResults;

  // 1. DAMAGE DETECTION RISK FACTORS (0-40 points)
  if (damageDetection) {
    const damageRisk = calculateDamageRisk(damageDetection);
    riskScore += damageRisk.score;
    if (damageRisk.score > 0) {
      breakdown.push({ factor: "Damage Anomaly", score: damageRisk.score });
      reasons.push(...damageRisk.reasons);
    }
    if (damageRisk.warnings.length > 0) {
      warnings.push(...damageRisk.warnings);
    }
  }

  // 2. VEHICLE VALIDATION RISK FACTORS (0-30 points)
  if (vehicleValidation) {
    const vehicleRisk = calculateVehicleRisk(vehicleValidation);
    riskScore += vehicleRisk.score;
    if (vehicleRisk.score > 0) {
      breakdown.push({ factor: "Vehicle Mismatch", score: vehicleRisk.score });
      reasons.push(...vehicleRisk.reasons);
    }
    if (vehicleRisk.warnings.length > 0) {
      warnings.push(...vehicleRisk.warnings);
    }
  }

  // 3. OCR VALIDATION RISK FACTORS (0-25 points)
  if (ocrExtraction) {
    const ocrRisk = calculateOCRRisk(ocrExtraction, claimData);
    riskScore += ocrRisk.score;
    if (ocrRisk.score > 0) {
      breakdown.push({ factor: "OCR Discrepancy", score: ocrRisk.score });
      reasons.push(...ocrRisk.reasons);
    }
    if (ocrRisk.warnings.length > 0) {
      warnings.push(...ocrRisk.warnings);
    }
  }

  // 4. POLICY MATCH RISK FACTORS (0-20 points)
  if (policyMatch !== undefined) {
    const policyRisk = calculatePolicyRisk(policyMatch, claimData);
    riskScore += policyRisk.score;
    if (policyRisk.score > 0) {
      breakdown.push({ factor: "Policy Issue", score: policyRisk.score });
      reasons.push(...policyRisk.reasons);
    }
  }

  // 5. HISTORICAL BEHAVIOR RISK FACTORS (0-15 points)
  if (userHistory.length > 0) {
    const historyRisk = calculateHistoricalRisk(userHistory, claimData);
    riskScore += historyRisk.score;
    if (historyRisk.score > 0) {
      breakdown.push({ factor: "Suspicious History", score: historyRisk.score });
      reasons.push(...historyRisk.reasons);
    }
  }

  // 6. TIMING AND PATTERN RISK FACTORS (0-10 points)
  const timingRisk = calculateTimingRisk(claimData);
  riskScore += timingRisk.score;
  if (timingRisk.score > 0) {
    breakdown.push({ factor: "Timing Anomaly", score: timingRisk.score });
    reasons.push(...timingRisk.reasons);
  }

  // Determine risk status
  const riskStatus = determineRiskStatus(riskScore);
  
  // Calculate confidence based on validation completeness
  const validationConfidence = calculateValidationConfidence(validationResults);

  return {
    riskScore: Math.min(Math.max(riskScore, 0), 100),
    riskStatus,
    reasons: reasons.length > 0 ? reasons : ["All validations passed - claim appears legitimate"],
    breakdown,
    warnings: warnings.length > 0 ? warnings : [],
    validationConfidence,
    recommendation: getRecommendation(riskScore, riskStatus),
    requiresManualReview: riskScore >= 40 || riskStatus === 'HIGH_RISK'
  };
}

// Damage Detection Risk Calculation
function calculateDamageRisk(damageDetection) {
  let score = 0;
  const reasons = [];
  const warnings = [];

  if (!damageDetection || damageDetection.status !== "OK") {
    score += 15;
    reasons.push("Damage detection failed or inconclusive");
    return { score, reasons, warnings };
  }

  const { severity, percentage, confidence } = damageDetection;

  // Low confidence in damage detection
  if (confidence < 0.6) {
    score += 10;
    reasons.push(`Low confidence (${Math.round(confidence * 100)}%) in damage detection`);
  }

  // Severe damage with low claim amount (potential under-reporting)
  if (severity === 'SEVERE' && percentage > 50) {
    score += 20;
    reasons.push(`Severe damage (${percentage}%) detected - requires thorough inspection`);
  }

  // No damage but claim filed
  if (severity === 'NO_DAMAGE' || percentage < 5) {
    score += 25;
    reasons.push(`Claim filed for minimal or no damage (${percentage}%)`);
  }

  // Inconsistent damage patterns
  if (severity === 'MODERATE' && percentage > 30 && confidence < 0.7) {
    score += 15;
    reasons.push(`Moderate damage with inconsistent detection patterns`);
    warnings.push("Damage pattern may require manual verification");
  }

  return { score, reasons, warnings };
}

// Vehicle Validation Risk Calculation
function calculateVehicleRisk(vehicleValidation) {
  let score = 0;
  const reasons = [];
  const warnings = [];

  if (!vehicleValidation) {
    score += 20;
    reasons.push("Vehicle validation not performed");
    return { score, reasons, warnings };
  }

  const { match, confidence, matchType, block } = vehicleValidation;

  // Vehicle mismatch
  if (!match) {
    score += 30;
    reasons.push("Uploaded vehicle does not match insured vehicle");
    if (block) {
      reasons.push("Vehicle mismatch is severe - claim should be blocked");
    }
  }

  // Partial match only
  if (match && matchType === 'partial') {
    score += 15;
    reasons.push("Vehicle matches partially (brand or model only)");
    warnings.push("Verify vehicle details manually");
  }

  // Low confidence in vehicle detection
  if (confidence < 0.6) {
    score += 10;
    reasons.push(`Low confidence (${Math.round(confidence * 100)}%) in vehicle detection`);
  }

  // Brand match only (higher risk than exact match)
  if (matchType === 'brand') {
    score += 20;
    reasons.push("Only vehicle brand matches - model differs");
  }

  return { score, reasons, warnings };
}

// OCR Validation Risk Calculation
function calculateOCRRisk(ocrExtraction, claimData) {
  let score = 0;
  const reasons = [];
  const warnings = [];

  if (!ocrExtraction || !ocrExtraction.success) {
    score += 15;
    reasons.push("OCR extraction failed");
    return { score, reasons, warnings };
  }

  const { fields, validation, ocrConfidence } = ocrExtraction;

  // Low OCR confidence
  if (ocrConfidence < 50) {
    score += 10;
    reasons.push(`Low OCR confidence (${Math.round(ocrConfidence)}%)`);
  }

  // Amount mismatch between OCR and claim
  if (fields.amount && claimData.amount) {
    const claimAmount = Number(claimData.amount);
    const ocrAmount = Number(fields.amount);
    
    if (!isNaN(claimAmount) && !isNaN(ocrAmount)) {
      const difference = Math.abs(claimAmount - ocrAmount);
      const percentageDiff = (difference / claimAmount) * 100;
      
      if (percentageDiff > 10) {
        score += 20;
        reasons.push(`Significant amount mismatch: Claim ₹${claimAmount} vs OCR ₹${ocrAmount} (${Math.round(percentageDiff)}% difference)`);
      } else if (percentageDiff > 5) {
        score += 10;
        reasons.push(`Moderate amount mismatch: Claim ₹${claimAmount} vs OCR ₹${ocrAmount}`);
        warnings.push("Verify claimed amount against document");
      }
    }
  }

  // Policy number mismatch
  if (fields.policyNumber && claimData.policyNumber) {
    const normalizedClaim = claimData.policyNumber.replace(/\s+/g, '').toUpperCase();
    const normalizedOCR = fields.policyNumber.replace(/\s+/g, '').toUpperCase();
    
    if (normalizedClaim !== normalizedOCR) {
      score += 25;
      reasons.push(`Policy number mismatch: Claim "${claimData.policyNumber}" vs OCR "${fields.policyNumber}"`);
    }
  }

  // Date inconsistencies
  if (fields.date && claimData.incidentDate) {
    const ocrDate = new Date(fields.date);
    const claimDate = new Date(claimData.incidentDate);
    
    if (!isNaN(ocrDate.getTime()) && !isNaN(claimDate.getTime())) {
      const dayDiff = Math.abs((claimDate - ocrDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff > 7) {
        score += 15;
        reasons.push(`Date discrepancy: Claim ${claimData.incidentDate} vs Document ${fields.date} (${Math.round(dayDiff)} days difference)`);
      }
    }
  }

  // Missing critical fields in OCR
  if (validation && !validation.isValid) {
    score += validation.issues.length * 5;
    reasons.push(...validation.issues.map(issue => `OCR validation: ${issue}`));
  }

  return { score, reasons, warnings };
}

// Policy Match Risk Calculation
function calculatePolicyRisk(policyMatch, claimData) {
  let score = 0;
  const reasons = [];

  if (!policyMatch) {
    score += 20;
    reasons.push("Policy validation not performed");
    return { score, reasons };
  }

  // Policy coverage mismatch
  if (policyMatch.coverageMismatch) {
    score += 15;
    reasons.push(`Claim type "${claimData.type}" not covered by policy`);
  }

  // Policy expired
  if (policyMatch.expired) {
    score += 25;
    reasons.push("Policy has expired");
  }

  // Claim amount exceeds policy limit
  if (policyMatch.exceedsLimit) {
    score += 20;
    reasons.push(`Claim amount exceeds policy limit by ${policyMatch.excessPercentage}%`);
  }

  // Deductible not met
  if (policyMatch.deductibleNotMet) {
    score += 10;
    reasons.push("Claim amount below deductible threshold");
  }

  return { score, reasons };
}

// Historical Risk Calculation
function calculateHistoricalRisk(userHistory, currentClaim) {
  let score = 0;
  const reasons = [];

  if (userHistory.length === 0) {
    return { score, reasons };
  }

  // Frequency of claims
  const recentClaims = userHistory.filter(claim => {
    const claimDate = new Date(claim.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return claimDate > sixMonthsAgo;
  });

  if (recentClaims.length >= 3) {
    score += 15;
    reasons.push(`User has ${recentClaims.length} claims in last 6 months`);
  }

  // Similar claim patterns
  const similarClaims = userHistory.filter(claim => 
    claim.type === currentClaim.type && 
    claim.location === currentClaim.location
  );

  if (similarClaims.length > 0) {
    score += 10;
    reasons.push(`User has ${similarClaims.length} similar ${currentClaim.type} claims at ${currentClaim.location}`);
  }

  // Increasing claim amounts
  const claimAmounts = userHistory.map(c => Number(c.amount) || 0).filter(a => a > 0);
  if (claimAmounts.length >= 2) {
    const avgAmount = claimAmounts.reduce((a, b) => a + b, 0) / claimAmounts.length;
    const currentAmount = Number(currentClaim.amount) || 0;
    
    if (currentAmount > avgAmount * 1.5) {
      score += 10;
      reasons.push(`Current claim amount (₹${currentAmount}) is 50% higher than average (₹${Math.round(avgAmount)})`);
    }
  }

  return { score, reasons };
}

// Timing Risk Calculation
function calculateTimingRisk(claimData) {
  let score = 0;
  const reasons = [];

  // Handle undefined or null claimData
  if (!claimData) {
    return { score, reasons };
  }

  const claimDate = new Date(claimData.date || claimData.incidentDate || new Date());
  const policyStartDate = new Date(claimData.policyStartDate || new Date());
  
  // Claim soon after policy start
  const daysSincePolicyStart = (claimDate - policyStartDate) / (1000 * 60 * 60 * 24);
  if (daysSincePolicyStart < 30) {
    score += 10;
    reasons.push(`Claim filed ${Math.round(daysSincePolicyStart)} days after policy start`);
  }

  // Weekend or holiday claim
  const dayOfWeek = claimDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    score += 5;
    reasons.push("Claim filed on weekend");
  }

  // Late night claim filing (if timestamp available)
  if (claimData.timestamp) {
    const claimTime = new Date(claimData.timestamp).getHours();
    if (claimTime >= 22 || claimTime <= 6) {
      score += 5;
      reasons.push(`Claim filed during late hours (${claimTime}:00)`);
    }
  }

  return { score, reasons };
}

// Determine Risk Status
function determineRiskStatus(score) {
  if (score >= 70) return 'CRITICAL';
  if (score >= 50) return 'HIGH_RISK';
  if (score >= 30) return 'MEDIUM_RISK';
  if (score >= 15) return 'LOW_RISK';
  return 'SAFE';
}

// Calculate Validation Confidence
function calculateValidationConfidence(validationResults) {
  const validations = [];
  
  if (validationResults.damageDetection) validations.push(validationResults.damageDetection.confidence || 0);
  if (validationResults.vehicleValidation) validations.push(validationResults.vehicleValidation.confidence || 0);
  if (validationResults.ocrExtraction) validations.push((validationResults.ocrExtraction.ocrConfidence || 0) / 100);
  
  if (validations.length === 0) return 0;
  
  const averageConfidence = validations.reduce((a, b) => a + b, 0) / validations.length;
  return Math.round(averageConfidence * 100);
}

// Get Recommendation
function getRecommendation(score, status) {
  if (status === 'CRITICAL') {
    return 'BLOCK_CLAIM - Immediate manual investigation required';
  }
  if (status === 'HIGH_RISK') {
    return 'HOLD_CLAIM - Requires senior review before processing';
  }
  if (status === 'MEDIUM_RISK') {
    return 'PROCEED_WITH_CAUTION - Additional verification recommended';
  }
  if (status === 'LOW_RISK') {
    return 'PROCEED - Standard verification sufficient';
  }
  return 'AUTO_APPROVE - Minimal risk detected';
}

// Utility function to process complete claim validation
export async function processClaimValidation(claimData, userHistory = []) {
  // This would integrate with actual AI services
  // For now, returns mock validation results
  const validationResults = {
    damageDetection: {
      severity: 'MODERATE',
      percentage: 35,
      confidence: 0.78,
      status: 'OK'
    },
    vehicleValidation: {
      match: true,
      confidence: 0.85,
      matchType: 'exact',
      block: false
    },
    ocrExtraction: {
      success: true,
      extractedText: 'Sample extracted text...',
      fields: {
        amount: claimData.amount,
        policyNumber: claimData.policyNumber,
        date: claimData.incidentDate
      },
      validation: { isValid: true, issues: [] },
      ocrConfidence: 82
    },
    policyMatch: {
      valid: true,
      coverageMismatch: false,
      expired: false,
      exceedsLimit: false
    }
  };

  return calculateRiskScore(validationResults, claimData, userHistory);
}

// Export utility functions for testing
export {
  calculateDamageRisk,
  calculateVehicleRisk,
  calculateOCRRisk,
  calculatePolicyRisk,
  calculateHistoricalRisk,
  calculateTimingRisk,
  determineRiskStatus,
  calculateValidationConfidence,
  getRecommendation
};