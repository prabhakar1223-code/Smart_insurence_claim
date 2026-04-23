// services/fraudService.js

/**
 * Calculate the risk score of an insurance claim.
 *
 * @param {Object} claimData - The data of the incoming claim
 * @param {Array} userHistory - Past claims of this specific user
 * @param {Array} pastClaims - All past claims across all users
 * @returns {Object} { riskScore, status, reasons, breakdown }
 */
export function calculateRiskScore(claimData, userHistory, pastClaims) {
  let riskScore = 0;
  const reasons = [];
  const breakdown = [];

  const amount = Number(claimData.amount) || 0;
  
  // 1. Amount Anomaly (+20)
  // Higher than 100k or significantly higher than user's average
  const avgAmount = userHistory.length > 0 
    ? userHistory.reduce((acc, c) => acc + (Number(c.amount) || 0), 0) / userHistory.length 
    : 50000;
  
  if (amount > avgAmount * 2 || amount > 150000) {
      riskScore += 20;
      reasons.push("Claim amount is significantly higher than expected baseline or average");
      breakdown.push({ factor: "Amount Anomaly", score: 20 });
  }

  // 2. Repeated Location (+25)
  const locationOrEntity = (claimData.repairDetails || claimData.hospitalName || claimData.location || "").toLowerCase().trim();
  if (locationOrEntity && locationOrEntity.length > 5) {
      const sameLocationClaims = pastClaims.filter(c => {
          const cLoc = (c.repairDetails || c.hospitalName || c.location || "").toLowerCase().trim();
          return cLoc === locationOrEntity && c.userName !== claimData.userName;
      });
      if (sameLocationClaims.length > 0) {
          riskScore += 25;
          reasons.push("Same incident location or entity used across multiple users");
          breakdown.push({ factor: "Location Repetition", score: 25 });
      }
  }

  // 3. Repeated Doctor / Repair Shop (+20)
  const doctorOrProfessional = (claimData.doctorName || claimData.workshopName || "").toLowerCase().trim();
  if (doctorOrProfessional && doctorOrProfessional.length > 3) {
      const sameProfessionalClaims = pastClaims.filter(c => {
        const cProf = (c.doctorName || c.workshopName || "").toLowerCase().trim();
        return cProf === doctorOrProfessional && c.userName !== claimData.userName;
      });
      if (sameProfessionalClaims.length > 0) {
          riskScore += 20;
          reasons.push("Same doctor/professional reported in other suspicious claims");
          breakdown.push({ factor: "Professional Repetition", score: 20 });
      }
  }

  // 4. OCR Mismatch (+15)
  const ocrAmount = claimData.extractedData?.amount;
  const isOcrMismatch = ocrAmount !== null && ocrAmount !== undefined && Math.abs(Number(ocrAmount) - amount) > 10;
  if (isOcrMismatch) {
      riskScore += 15;
      reasons.push("OCR mismatch detected: Extracted amount doesn't match user input");
      breakdown.push({ factor: "OCR Mismatch", score: 15 });
  }

  // 5. User Fraud History (+30)
  const previousSuspiciousOrRejected = userHistory.filter(c => c.status === "REJECTED" || c.markedAsFraud === true);
  if (previousSuspiciousOrRejected.length > 0) {
      riskScore += 30;
      reasons.push("User has a history of rejected or fraudulent claims");
      breakdown.push({ factor: "User History", score: 30 });
  }

  // 6. Claim soon after policy start (+20) (Simulated since we don't have Policy Start Date)
  // We check if it's the user's first claim and amount is > 50k
  if (userHistory.length === 0 && amount > 50000) {
      riskScore += 20;
      reasons.push("Claim filed for high amount shortly after policy start/activity");
      breakdown.push({ factor: "Policy Timing", score: 20 });
  }

  // 7. Missing or Weak Evidence (+15)
  if (!claimData.description || claimData.description.trim().length < 20) {
      riskScore += 10;
      reasons.push("Claim description is too vague or missing details");
      breakdown.push({ factor: "Weak Evidence", score: 10 });
  }

  // 8. Too many claims in short time (+15)
  const now = new Date();
  const recentClaims = userHistory.filter(c => {
      const diffDays = (now - new Date(c.submittedDate)) / (1000 * 60 * 60 * 24);
      return diffDays < 30;
  });
  if (recentClaims.length >= 2) {
      riskScore += 15;
      reasons.push("Too many claims filed by this user in a short period of time");
      breakdown.push({ factor: "Frequency Burst", score: 15 });
  }

  // 9. Duplicate Image or Description Detection (+25)
  const isDuplicate = pastClaims.some(c => {
    // Basic text duplication check
    if (c.id !== claimData.id && claimData.description && c.description === claimData.description && claimData.description.length > 10) return true;
    return false;
  });
  if (isDuplicate) {
    riskScore += 25;
    reasons.push("Duplicate description or evidence detected across multiple claims");
    breakdown.push({ factor: "Duplicate Detection", score: 25 });
  }

  // Cap Score at 100
  riskScore = Math.min(Math.round(riskScore), 100);

  // Decision Logic - Updated based on requirements
  let status = "APPROVED";
  if (riskScore >= 70) {
      status = "REJECTED";
  } else if (riskScore > 50) {
      // Risk score > 50: Send to fraud alert section
      status = "FRAUD_ALERT";
  } else if (riskScore >= 35) {
      // Risk score 35-50: Manual review
      status = "MANUAL_REVIEW";
  } else {
      // Risk score < 35: Auto-approved
      status = "APPROVED";
  }

  if (reasons.length === 0) {
      reasons.push("Claim details align with policy limits and OCR verification");
  }

  return {
      riskScore,
      status,
      reasons,
      breakdown
  };
}
