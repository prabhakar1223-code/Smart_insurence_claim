// services/fraudService.js
// Updated to use the new advanced risk scoring service with 10 weighted factors

import { calculateAdvancedRiskScore } from './advancedRiskService.js';

/**
 * Calculate the risk score of an insurance claim using the new weighted factors.
 * This is a wrapper around the advanced risk scoring service for backward compatibility.
 *
 * @param {Object} claimData - The data of the incoming claim
 * @param {Array} userHistory - Past claims of this specific user
 * @param {Array} pastClaims - All past claims across all users
 * @returns {Object} { riskScore, status, reasons, breakdown, routingPriority, decisionThresholds }
 */
export function calculateRiskScore(claimData, userHistory, pastClaims) {
  // Use the new advanced risk scoring service
  const result = calculateAdvancedRiskScore(claimData, userHistory, pastClaims, {});
  
  // Map the result to maintain backward compatibility
  return {
    riskScore: result.riskScore,
    status: result.status,
    reasons: result.riskReasons,
    breakdown: result.breakdown,
    routingPriority: result.routingPriority,
    decisionThresholds: result.decisionThresholds
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateRiskScore instead
 */
export function calculateFraudScore(claimData, userHistory, pastClaims) {
  return calculateRiskScore(claimData, userHistory, pastClaims);
}
