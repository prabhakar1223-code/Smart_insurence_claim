// services/advancedRiskService.js
// Unified risk scoring service with 10 weighted factors

/**
 * Calculate comprehensive risk score using 10 weighted factors
 * @param {Object} claimData - The data of the incoming claim
 * @param {Array} userHistory - Past claims of this specific user
 * @param {Array} allPastClaims - All past claims across all users
 * @param {Object} validationResults - AI validation results (damage, vehicle, OCR)
 * @returns {Object} { riskScore, status, riskReasons, breakdown, routingPriority }
 */
export function calculateAdvancedRiskScore(claimData, userHistory = [], allPastClaims = [], validationResults = {}) {
  let riskScore = 0;
  const riskReasons = [];
  const breakdown = [];
  
  const amount = Number(claimData.amount) || 0;
  const now = new Date();
  
  // 1. CLAIM AMOUNT ANOMALY (+30)
  const avgAmount = userHistory.length > 0 
    ? userHistory.reduce((acc, c) => acc + (Number(c.amount) || 0), 0) / userHistory.length 
    : 50000;
  
  if (amount > avgAmount * 2 || amount > 150000) {
    riskScore += 30;
    riskReasons.push(`Claim amount (₹${amount.toLocaleString()}) is significantly higher than user average (₹${avgAmount.toLocaleString()}) or exceeds ₹150,000 threshold`);
    breakdown.push({ factor: "Claim Amount Anomaly", score: 30, weight: "High" });
  }
  
  // 2. FREQUENCY BURST (+25)
  const recentClaims = userHistory.filter(c => {
    const diffDays = (now - new Date(c.submittedDate)) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  });
  
  if (recentClaims.length >= 2) {
    riskScore += 25;
    riskReasons.push(`User has filed ${recentClaims.length} claims in the last 30 days (frequency burst detected)`);
    breakdown.push({ factor: "Frequency Burst", score: 25, weight: "High" });
  }
  
  // 3. DUPLICATE INCIDENT LOCATION (+20)
  const locationOrEntity = (claimData.repairDetails || claimData.hospitalName || claimData.location || "").toLowerCase().trim();
  if (locationOrEntity && locationOrEntity.length > 5) {
    const sameLocationClaims = allPastClaims.filter(c => {
      const cLoc = (c.repairDetails || c.hospitalName || c.location || "").toLowerCase().trim();
      return cLoc === locationOrEntity && c.userName !== claimData.userName;
    });
    
    if (sameLocationClaims.length > 0) {
      riskScore += 20;
      riskReasons.push(`Same incident location/entity "${locationOrEntity}" used across ${sameLocationClaims.length} other claims by different users`);
      breakdown.push({ factor: "Duplicate Incident Location", score: 20, weight: "Medium" });
    }
  }
  
  // 4. SAME DOCTOR/REPAIR SHOP REPETITION (+20)
  const doctorOrProfessional = (claimData.doctorName || claimData.workshopName || "").toLowerCase().trim();
  if (doctorOrProfessional && doctorOrProfessional.length > 3) {
    const sameProfessionalClaims = allPastClaims.filter(c => {
      const cProf = (c.doctorName || c.workshopName || "").toLowerCase().trim();
      return cProf === doctorOrProfessional && c.userName !== claimData.userName;
    });
    
    if (sameProfessionalClaims.length > 0) {
      riskScore += 20;
      riskReasons.push(`Same doctor/professional "${doctorOrProfessional}" reported in ${sameProfessionalClaims.length} other suspicious claims`);
      breakdown.push({ factor: "Professional Repetition", score: 20, weight: "Medium" });
    }
  }
  
  // 5. POLICY FRESH ACTIVATION (+20)
  // Check if this is user's first claim and amount is high
  if (userHistory.length === 0 && amount > 50000) {
    riskScore += 20;
    riskReasons.push(`High claim amount (₹${amount.toLocaleString()}) filed shortly after policy start/activation (first claim)`);
    breakdown.push({ factor: "Policy Fresh Activation", score: 20, weight: "Medium" });
  }
  
  // 6. OCR MISMATCH (+35)
  const ocrAmount = claimData.extractedData?.amount || validationResults.ocrExtraction?.amount;
  const userAmount = amount;
  const isOcrMismatch = ocrAmount !== null && ocrAmount !== undefined && 
                        Math.abs(Number(ocrAmount) - userAmount) > (userAmount * 0.1); // >10% difference
  
  if (isOcrMismatch) {
    riskScore += 35;
    riskReasons.push(`OCR mismatch detected: Extracted amount (₹${ocrAmount}) differs from user input (₹${userAmount}) by more than 10%`);
    breakdown.push({ factor: "OCR Mismatch", score: 35, weight: "High" });
  }
  
  // 7. VEHICLE MISMATCH (+40)
  const vehicleMatch = validationResults.vehicleValidation?.match;
  const vehicleConfidence = validationResults.vehicleValidation?.confidence || 0;
  
  if (vehicleMatch === false) {
    riskScore += 40;
    riskReasons.push("Uploaded vehicle does not match insured vehicle (severe mismatch)");
    breakdown.push({ factor: "Vehicle Mismatch", score: 40, weight: "Critical" });
  } else if (vehicleMatch === true && vehicleConfidence < 0.6) {
    riskScore += 20;
    riskReasons.push(`Low confidence (${Math.round(vehicleConfidence * 100)}%) in vehicle validation`);
    breakdown.push({ factor: "Vehicle Validation Low Confidence", score: 20, weight: "Medium" });
  }
  
  // 8. TAMPERED DOCUMENT DETECTION (+40)
  // Check for document tampering indicators
  const hasTamperingIndicators = checkDocumentTampering(claimData, validationResults);
  if (hasTamperingIndicators) {
    riskScore += 40;
    riskReasons.push("Potential document tampering detected (inconsistent metadata, editing artifacts)");
    breakdown.push({ factor: "Tampered Document Detection", score: 40, weight: "Critical" });
  }
  
  // 9. PREVIOUS FRAUD HISTORY (+30)
  const previousSuspiciousOrRejected = userHistory.filter(c => 
    c.status === "REJECTED" || c.markedAsFraud === true || c.fraudScore >= 70
  );
  
  if (previousSuspiciousOrRejected.length > 0) {
    riskScore += 30;
    riskReasons.push(`User has ${previousSuspiciousOrRejected.length} previous rejected or fraudulent claims`);
    breakdown.push({ factor: "Previous Fraud History", score: 30, weight: "High" });
  }
  
  // 10. IMAGE CONFIDENCE LOW (+15)
  const damageConfidence = validationResults.damageDetection?.confidence || 0;
  const ocrConfidence = validationResults.ocrExtraction?.confidence || 0;
  
  if (damageConfidence < 0.6 || ocrConfidence < 0.6) {
    riskScore += 15;
    riskReasons.push(`Low confidence in AI validation (damage: ${Math.round(damageConfidence * 100)}%, OCR: ${Math.round(ocrConfidence * 100)}%)`);
    breakdown.push({ factor: "Image Confidence Low", score: 15, weight: "Low" });
  }
  
  // Cap score at 100
  riskScore = Math.min(Math.round(riskScore), 100);
  
  // Determine status based on new auto-routing thresholds
  let status = "AUTO_APPROVE";
  let routingPriority = "IMMEDIATE";
  
  if (riskScore <= 20) {
    status = "AUTO_APPROVE";
    routingPriority = "IMMEDIATE";
  } else if (riskScore <= 35) {
    status = "FAST_TRACK";
    routingPriority = "HIGH";
  } else if (riskScore <= 50) {
    status = "STANDARD_REVIEW";
    routingPriority = "MEDIUM";
  } else if (riskScore <= 75) {
    status = "ENHANCED_REVIEW";
    routingPriority = "HIGH";
  } else {
    status = "AUTO_REJECT";
    routingPriority = "CRITICAL";
  }
  
  // Add default reason if no specific risks detected
  if (riskReasons.length === 0) {
    riskReasons.push("Claim appears legitimate - all validations passed");
  }
  
  return {
    riskScore,
    status,
    riskReasons,
    breakdown,
    routingPriority,
    decisionThresholds: {
      autoApprove: 20,
      fastTrack: 35,
      standardReview: 50,
      enhancedReview: 75,
      autoReject: 100
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Check for document tampering indicators
 */
function checkDocumentTampering(claimData, validationResults) {
  const indicators = [];
  
  // Check for inconsistent metadata
  if (claimData.uploadedFiles) {
    const files = Array.isArray(claimData.uploadedFiles) ? claimData.uploadedFiles : [claimData.uploadedFiles];
    
    files.forEach(file => {
      // Check for suspicious file properties
      if (file.name && file.name.includes('edited') || file.name.includes('copy')) {
        indicators.push('File name suggests editing');
      }
      
      // Check for very recent modification dates
      if (file.lastModified) {
        const modDate = new Date(file.lastModified);
        const now = new Date();
        const diffHours = (now - modDate) / (1000 * 60 * 60);
        
        if (diffHours < 1) {
          indicators.push('File modified very recently before upload');
        }
      }
    });
  }
  
  // Check OCR results for inconsistencies
  const ocrFields = validationResults.ocrExtraction?.fields || {};
  const hasInconsistentDates = checkDateInconsistencies(ocrFields);
  if (hasInconsistentDates) {
    indicators.push('Inconsistent dates in extracted document');
  }
  
  return indicators.length > 0;
}

/**
 * Check for date inconsistencies in OCR extracted fields
 */
function checkDateInconsistencies(ocrFields) {
  const dates = [];
  
  if (ocrFields.date) dates.push(new Date(ocrFields.date));
  if (ocrFields.issueDate) dates.push(new Date(ocrFields.issueDate));
  if (ocrFields.incidentDate) dates.push(new Date(ocrFields.incidentDate));
  
  if (dates.length < 2) return false;
  
  // Check if dates are in logical order
  const sortedDates = [...dates].sort((a, b) => a - b);
  const dateDifferences = [];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
    dateDifferences.push(diffDays);
  }
  
  // If any date is significantly out of order (e.g., incident date after claim date)
  const hasIllogicalOrder = dateDifferences.some(diff => diff < -30); // More than 30 days backward
  
  return hasIllogicalOrder;
}

/**
 * Calculate risk score using the new weighted factors (backward compatible wrapper)
 */
export function calculateRiskScore(claimData, userHistory = [], allPastClaims = []) {
  return calculateAdvancedRiskScore(claimData, userHistory, allPastClaims, {});
}

/**
 * Get risk assessment summary for display
 */
export function getRiskAssessmentSummary(riskResult) {
  const { riskScore, status, riskReasons, breakdown } = riskResult;
  
  let severity = "LOW";
  let color = "green";
  let icon = "✅";
  
  if (riskScore >= 70) {
    severity = "CRITICAL";
    color = "red";
    icon = "🚨";
  } else if (riskScore >= 50) {
    severity = "HIGH";
    color = "orange";
    icon = "⚠️";
  } else if (riskScore >= 30) {
    severity = "MEDIUM";
    color = "yellow";
    icon = "🔍";
  }
  
  return {
    severity,
    color,
    icon,
    summary: `${icon} Risk Score: ${riskScore}/100 (${severity}) - ${status}`,
    topFactors: breakdown.slice(0, 3).map(f => `${f.factor}: +${f.score}`)
  };
}