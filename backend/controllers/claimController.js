import { detectDamage } from '../services/damageService.js';
import { detectVehicle, validateVehicle } from '../services/vehicleService.js';
import { extractDocumentData, validateExtractedData } from '../services/ocrService.js';
import { calculateRiskScore } from '../services/riskService.js';
import fs from 'fs';
import path from 'path';

/**
 * Claim Processing Controller
 * Integrates all AI validation services for comprehensive claim processing
 */
class ClaimProcessingController {
  /**
   * Process a complete insurance claim with AI validation
   * @param {Object} claimData - Claim form data
   * @param {Object} files - Uploaded files (damageImage, vehicleImage, documentImage)
   * @returns {Promise<Object>} Comprehensive validation results
   */
  async processClaim(claimData, files) {
    try {
      console.log('🚀 Starting AI validation pipeline for claim processing');
      
      // Step 1: Damage Detection (if damage image provided)
      const damageResult = files.damageImage 
        ? await this.processDamageDetection(files.damageImage[0])
        : { status: 'SKIPPED', message: 'No damage image provided' };
      
      // Step 2: Vehicle Validation (if vehicle image provided)
      const vehicleResult = files.vehicleImage
        ? await this.processVehicleValidation(files.vehicleImage[0], claimData.vehicleModel)
        : { status: 'SKIPPED', message: 'No vehicle image provided' };
      
      // Step 3: Document OCR Extraction (if document image provided)
      const ocrResult = files.documentImage
        ? await this.processDocumentOCR(files.documentImage[0], claimData.claimType)
        : { status: 'SKIPPED', message: 'No document image provided' };
      
      // Step 4: Risk Calculation (integrate all validation results)
      const riskResult = await this.calculateIntegratedRisk({
        claimData,
        damageResult,
        vehicleResult,
        ocrResult
      });
      
      // Step 5: Generate final validation decision
      const validationDecision = this.generateValidationDecision(riskResult);
      
      // Step 6: Prepare comprehensive response
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        claimId: claimData.claimId || `CLM-${Date.now()}`,
        validation: validationDecision,
        aiValidations: {
          damage: damageResult,
          vehicle: vehicleResult,
          document: ocrResult,
          risk: riskResult
        },
        recommendations: this.generateRecommendations(riskResult, damageResult, vehicleResult, ocrResult),
        nextSteps: this.determineNextSteps(validationDecision)
      };
      
      console.log('✅ AI validation pipeline completed successfully');
      return response;
      
    } catch (error) {
      console.error('❌ Error in claim processing:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        validation: {
          status: 'FAILED',
          decision: 'MANUAL_REVIEW_REQUIRED',
          confidence: 0,
          reasons: ['AI validation pipeline failed', error.message]
        }
      };
    }
  }
  
  /**
   * Process damage detection from uploaded image
   */
  async processDamageDetection(damageImage) {
    try {
      console.log('🔍 Processing damage detection...');
      const result = await detectDamage(damageImage.path);
      
      // Enhance result with additional analysis
      const enhancedResult = {
        ...result,
        severity: this.determineDamageSeverity(result),
        repairEstimate: this.estimateRepairCost(result),
        validationStatus: this.validateDamageResult(result)
      };
      
      return enhancedResult;
    } catch (error) {
      console.error('Damage detection error:', error);
      return {
        status: 'ERROR',
        error: error.message,
        detectedDamage: 'UNKNOWN',
        confidence: 0,
        severity: 'UNKNOWN'
      };
    }
  }
  
  /**
   * Process vehicle validation from uploaded image
   */
  async processVehicleValidation(vehicleImage, policyVehicleModel) {
    try {
      console.log('🚗 Processing vehicle validation...');
      const detectionResult = await detectVehicle(vehicleImage.path);
      
      // Validate against policy vehicle model
      const validationResult = validateVehicle(detectionResult, policyVehicleModel);
      
      // Enhance with additional insights
      const enhancedResult = {
        detection: detectionResult,
        validation: validationResult,
        matchAnalysis: this.analyzeVehicleMatch(detectionResult, policyVehicleModel),
        confidenceLevel: this.calculateVehicleConfidence(detectionResult, validationResult)
      };
      
      return enhancedResult;
    } catch (error) {
      console.error('Vehicle validation error:', error);
      return {
        status: 'ERROR',
        error: error.message,
        detectedVehicle: 'UNKNOWN',
        validationStatus: 'FAILED'
      };
    }
  }
  
  /**
   * Process document OCR extraction
   */
  async processDocumentOCR(documentImage, claimType) {
    try {
      console.log('📄 Processing document OCR...');
      
      // Determine document type based on claim type
      const documentType = this.mapClaimTypeToDocumentType(claimType);
      
      // Extract data using enhanced OCR service
      const extractionResult = await extractDocumentData(documentImage.path, documentType);
      
      // Validate extracted data
      const validationResult = await validateExtractedData(extractionResult.fields, documentType);
      
      // Enhance with additional processing
      const enhancedResult = {
        extraction: extractionResult,
        validation: validationResult,
        documentType,
        completenessScore: this.calculateDocumentCompleteness(extractionResult.fields, documentType),
        dataQuality: this.assessDataQuality(extractionResult.fields)
      };
      
      return enhancedResult;
    } catch (error) {
      console.error('Document OCR error:', error);
      return {
        status: 'ERROR',
        error: error.message,
        extractedFields: {},
        validationStatus: 'FAILED'
      };
    }
  }
  
  /**
   * Calculate integrated risk score combining all validation results
   */
  async calculateIntegratedRisk(validationResults) {
    try {
      console.log('📊 Calculating integrated risk score...');
      
      const { claimData, damageResult, vehicleResult, ocrResult } = validationResults;
      
      // Prepare data for risk calculation
      const riskData = {
        claimData,
        damageDetection: damageResult.status === 'SUCCESS' ? damageResult : null,
        vehicleValidation: vehicleResult.status === 'SUCCESS' ? vehicleResult : null,
        documentExtraction: ocrResult.status === 'SUCCESS' ? ocrResult : null,
        timestamp: new Date().toISOString()
      };
      
      // Calculate risk using risk service
      const riskScore = await calculateRiskScore(riskData);
      
      return riskScore;
    } catch (error) {
      console.error('Risk calculation error:', error);
      return {
        status: 'ERROR',
        error: error.message,
        overallScore: 50, // Default medium risk on error
        riskStatus: 'MEDIUM_RISK',
        breakdown: {},
        reasons: ['Risk calculation failed', error.message]
      };
    }
  }
  
  /**
   * Generate validation decision based on risk score and validation results
   * Updated auto-routing thresholds per user requirements:
   * 0-19: AUTO_APPROVE (Instant approval, no human review)
   * 20-75: UNDER_REVIEW (Send to fraud alert section for admin review)
   * 76-100: AUTO_REJECT (Instant rejection)
   */
  generateValidationDecision(riskResult) {
    const { overallScore, riskStatus } = riskResult;
    
    let decision, confidence, routingPriority;
    
    if (overallScore < 20) {
      decision = 'AUTO_APPROVE';
      confidence = 0.95;
      routingPriority = 'IMMEDIATE';
    } else if (overallScore <= 75) {
      decision = 'UNDER_REVIEW';
      confidence = 0.60;
      routingPriority = 'HIGH';
    } else {
      decision = 'AUTO_REJECT';
      confidence = 0.30;
      routingPriority = 'CRITICAL';
    }
    
    // Map riskStatus to new categories for backward compatibility
    let mappedRiskStatus = riskStatus;
    if (overallScore < 20) mappedRiskStatus = 'VERY_LOW_RISK';
    else if (overallScore <= 75) mappedRiskStatus = 'HIGH_RISK';
    else mappedRiskStatus = 'CRITICAL_RISK';
    
    return {
      status: 'COMPLETED',
      decision,
      confidence,
      routingPriority,
      riskScore: overallScore,
      riskStatus: mappedRiskStatus,
      decisionThresholds: {
        autoApprove: 20,
        fraudInvestigation: 75,
        autoReject: 76
      },
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations(riskResult, damageResult, vehicleResult, ocrResult) {
    const recommendations = [];
    
    // Risk-based recommendations
    if (riskResult.overallScore > 70) {
      recommendations.push({
        priority: 'HIGH',
        category: 'FRAUD_PREVENTION',
        action: 'Initiate fraud investigation protocol',
        reason: 'High risk score indicates potential fraud'
      });
    }
    
    if (riskResult.overallScore > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'VALIDATION',
        action: 'Request additional documentation',
        reason: 'Medium risk requires further verification'
      });
    }
    
    // Damage-specific recommendations
    if (damageResult.status === 'SUCCESS' && damageResult.severity === 'severe') {
      recommendations.push({
        priority: 'HIGH',
        category: 'DAMAGE_ASSESSMENT',
        action: 'Schedule professional damage assessment',
        reason: 'Severe damage detected requires expert evaluation'
      });
    }
    
    // Vehicle validation recommendations
    if (vehicleResult.status === 'SUCCESS' && vehicleResult.validation?.matchType === 'NO_MATCH') {
      recommendations.push({
        priority: 'HIGH',
        category: 'VEHICLE_VALIDATION',
        action: 'Verify vehicle ownership and policy details',
        reason: 'Vehicle mismatch detected between image and policy'
      });
    }
    
    // Document completeness recommendations
    if (ocrResult.status === 'SUCCESS' && ocrResult.completenessScore < 0.7) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'DOCUMENTATION',
        action: 'Request clearer document images',
        reason: 'Document extraction incomplete or low quality'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Determine next steps based on validation decision
   */
  determineNextSteps(validationDecision) {
    const { decision } = validationDecision;
    
    const nextStepsMap = {
      AUTO_APPROVE: [
        'Process claim for immediate payment',
        'Notify claimant of approval',
        'Update claim status in system'
      ],
      FAST_TRACK: [
        'Complete minimal verification checks',
        'Process within 24 hours',
        'Notify claimant of fast-track status'
      ],
      STANDARD_REVIEW: [
        'Assign to claims adjuster',
        'Complete standard verification',
        'Process within 3-5 business days'
      ],
      ENHANCED_REVIEW: [
        'Assign to senior claims adjuster',
        'Request additional documentation',
        'Complete enhanced due diligence',
        'Process within 5-10 business days'
      ],
      AUTO_REJECT: [
        'Flag for fraud investigation team',
        'Freeze claim processing',
        'Collect additional evidence',
        'Notify legal department if needed',
        'Send rejection notification to claimant'
      ],
      // Keep FRAUD_INVESTIGATION for backward compatibility
      FRAUD_INVESTIGATION: [
        'Flag for fraud investigation team',
        'Freeze claim processing',
        'Collect additional evidence',
        'Notify legal department if needed'
      ]
    };
    
    return nextStepsMap[decision] || ['Manual review required'];
  }
  
  // Helper methods
  
  determineDamageSeverity(damageResult) {
    const { detectedDamage, confidence } = damageResult;
    
    if (detectedDamage === 'no_damage') return 'NONE';
    if (detectedDamage === 'minor') return 'MINOR';
    if (detectedDamage === 'moderate') return 'MODERATE';
    if (detectedDamage === 'severe') return 'SEVERE';
    
    // Fallback based on confidence
    if (confidence > 0.7) return 'MODERATE';
    if (confidence > 0.4) return 'MINOR';
    return 'UNKNOWN';
  }
  
  estimateRepairCost(damageResult) {
    const severity = this.determineDamageSeverity(damageResult);
    const { confidence } = damageResult;
    
    const costRanges = {
      NONE: { min: 0, max: 0 },
      MINOR: { min: 5000, max: 25000 },
      MODERATE: { min: 25000, max: 100000 },
      SEVERE: { min: 100000, max: 500000 }
    };
    
    const range = costRanges[severity] || costRanges.UNKNOWN;
    const estimatedCost = Math.round(
      range.min + (range.max - range.min) * confidence
    );
    
    return {
      severity,
      estimatedCost,
      currency: 'INR',
      confidence: confidence,
      range: `${range.min.toLocaleString()} - ${range.max.toLocaleString()} INR`
    };
  }
  
  validateDamageResult(damageResult) {
    const { detectedDamage, confidence } = damageResult;
    
    if (confidence < 0.3) return 'LOW_CONFIDENCE';
    if (detectedDamage === 'no_damage' && confidence > 0.6) return 'VALID_NO_DAMAGE';
    if (detectedDamage !== 'no_damage' && confidence > 0.5) return 'VALID_DAMAGE_DETECTED';
    
    return 'REQUIRES_MANUAL_REVIEW';
  }
  
  analyzeVehicleMatch(detectionResult, policyVehicleModel) {
    if (!policyVehicleModel) return 'NO_POLICY_MODEL_PROVIDED';
    
    const detected = detectionResult.detectedVehicle?.toLowerCase() || '';
    const policy = policyVehicleModel.toLowerCase();
    
    if (detected.includes(policy) || policy.includes(detected)) {
      return 'EXACT_OR_PARTIAL_MATCH';
    }
    
    // Check for brand match
    const commonBrands = ['toyota', 'honda', 'maruti', 'hyundai', 'tata', 'mahindra', 'ford'];
    const detectedBrand = commonBrands.find(brand => detected.includes(brand));
    const policyBrand = commonBrands.find(brand => policy.includes(brand));
    
    if (detectedBrand && policyBrand && detectedBrand === policyBrand) {
      return 'BRAND_MATCH_MODEL_MISMATCH';
    }
    
    return 'NO_MATCH';
  }
  
  calculateVehicleConfidence(detectionResult, validationResult) {
    let confidence = detectionResult.confidence || 0;
    
    // Adjust based on validation result
    if (validationResult.matchType === 'EXACT_MATCH') confidence *= 1.2;
    if (validationResult.matchType === 'PARTIAL_MATCH') confidence *= 1.0;
    if (validationResult.matchType === 'BRAND_MATCH') confidence *= 0.8;
    if (validationResult.matchType === 'NO_MATCH') confidence *= 0.5;
    
    return Math.min(confidence, 1.0);
  }
  
  mapClaimTypeToDocumentType(claimType) {
    const mapping = {
      'vehicle': 'vehicle',
      'car': 'vehicle',
      'auto': 'vehicle',
      'health': 'health',
      'medical': 'health',
      'home': 'home',
      'property': 'home',
      'life': 'life',
      'travel': 'general'
    };
    
    return mapping[claimType?.toLowerCase()] || 'general';
  }
  
  calculateDocumentCompleteness(fields, documentType) {
    const requiredFields = {
      vehicle: ['policyNumber', 'vehicleNumber', 'date', 'amount'],
      health: ['policyNumber', 'patientName', 'date', 'amount'],
      home: ['policyNumber', 'propertyAddress', 'date', 'amount'],
      life: ['policyNumber', 'insuredName', 'date', 'amount'],
      general: ['policyNumber', 'date', 'amount']
    };
    
    const required = requiredFields[documentType] || requiredFields.general;
    const present = required.filter(field => fields[field] && fields[field] !== '');
    
    return present.length / required.length;
  }
  
  assessDataQuality(fields) {
    let score = 0;
    let total = 0;
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value && value !== '') {
        total++;
        // Simple quality checks
        if (typeof value === 'string' && value.length > 2) score++;
        if (typeof value === 'number' && value > 0) score++;
      }
    });
    
    return total > 0 ? score / total : 0;
  }
}

// Export singleton instance
const claimController = new ClaimProcessingController();
export default claimController;