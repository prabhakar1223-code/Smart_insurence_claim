// Enhanced Investigation Service for Admin Fraud Investigation System
import fs from 'fs';
import path from 'path';

class InvestigationService {
  constructor() {
    this.auditLogsPath = path.join(process.cwd(), 'data', 'audit_logs.json');
    this.claimsPath = path.join(process.cwd(), 'data', 'claims.json');
    this.investigationNotesPath = path.join(process.cwd(), 'data', 'investigation_notes.json');
    this.initializeInvestigationData();
  }

  initializeInvestigationData() {
    // Create investigation notes file if it doesn't exist
    if (!fs.existsSync(this.investigationNotesPath)) {
      fs.writeFileSync(this.investigationNotesPath, JSON.stringify([], null, 2));
    }
  }

  // Load data from JSON files
  loadAuditLogs() {
    try {
      const data = fs.readFileSync(this.auditLogsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      return [];
    }
  }

  loadClaims() {
    try {
      const data = fs.readFileSync(this.claimsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading claims:', error);
      return [];
    }
  }

  loadInvestigationNotes() {
    try {
      const data = fs.readFileSync(this.investigationNotesPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading investigation notes:', error);
      return [];
    }
  }

  saveInvestigationNotes(notes) {
    try {
      fs.writeFileSync(this.investigationNotesPath, JSON.stringify(notes, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving investigation notes:', error);
      return false;
    }
  }

  // Enhanced investigation analysis
  async analyzeClaimForInvestigation(claimId) {
    const claims = this.loadClaims();
    const claim = claims.find(c => c.id === claimId || c.claimId === claimId);
    
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }

    // Load investigation notes for this claim
    const allNotes = this.loadInvestigationNotes();
    const claimNotes = allNotes.filter(note => note.claimId === claimId || note.claimId === claim.id);

    // Load audit logs for this claim
    const auditLogs = this.loadAuditLogs();
    const claimAuditLogs = auditLogs.filter(log => 
      log.details && log.details.includes(claimId) || 
      (claim.id && log.details && log.details.includes(claim.id))
    );

    // Analyze risk factors
    const riskAnalysis = this.analyzeRiskFactors(claim);

    // Generate investigation timeline
    const timeline = this.generateInvestigationTimeline(claim, claimAuditLogs, claimNotes);

    // Generate recommendations
    const recommendations = this.generateInvestigationRecommendations(claim, riskAnalysis);

    return {
      success: true,
      claim,
      investigationSummary: {
        totalNotes: claimNotes.length,
        totalAuditEntries: claimAuditLogs.length,
        riskLevel: riskAnalysis.overallRisk,
        investigationPriority: this.determineInvestigationPriority(claim, riskAnalysis),
        estimatedInvestigationTime: this.estimateInvestigationTime(claim, riskAnalysis)
      },
      riskAnalysis,
      timeline,
      notes: claimNotes,
      recommendations,
      metadata: {
        analyzedAt: new Date().toISOString(),
        claimId: claimId,
        claimType: claim.claimType || claim.type || 'unknown'
      }
    };
  }

  analyzeRiskFactors(claim) {
    const factors = [];
    let totalRiskScore = 0;

    // 1. Amount anomaly
    const amount = claim.amount || 0;
    if (amount > 1000000) {
      factors.push({
        factor: 'High Claim Amount',
        severity: 'HIGH',
        score: 25,
        description: `Claim amount (₹${amount.toLocaleString()}) exceeds typical threshold`,
        recommendation: 'Verify supporting documents and compare with policy limits'
      });
      totalRiskScore += 25;
    }

    // 2. Frequency analysis
    const claims = this.loadClaims();
    const userClaims = claims.filter(c => c.userEmail === claim.userEmail || c.user === claim.user);
    if (userClaims.length > 3) {
      factors.push({
        factor: 'High Claim Frequency',
        severity: 'MEDIUM',
        score: 15,
        description: `User has ${userClaims.length} total claims`,
        recommendation: 'Review claim history for patterns'
      });
      totalRiskScore += 15;
    }

    // 3. Document quality
    if (claim.documentUrl && claim.documentUrl.includes('placeholder') || !claim.documentUrl) {
      factors.push({
        factor: 'Poor Document Quality',
        severity: 'MEDIUM',
        score: 10,
        description: 'Missing or placeholder documents',
        recommendation: 'Request proper documentation'
      });
      totalRiskScore += 10;
    }

    // 4. Timing analysis
    const submittedDate = new Date(claim.submittedDate || claim.createdAt);
    const policyStartDate = claim.policyStartDate ? new Date(claim.policyStartDate) : null;
    if (policyStartDate && (submittedDate - policyStartDate) < (30 * 24 * 60 * 60 * 1000)) {
      factors.push({
        factor: 'Early Claim Submission',
        severity: 'HIGH',
        score: 20,
        description: 'Claim submitted within 30 days of policy start',
        recommendation: 'Verify policy waiting period compliance'
      });
      totalRiskScore += 20;
    }

    // 5. Geographic anomalies
    if (claim.location && claim.userLocation && claim.location !== claim.userLocation) {
      factors.push({
        factor: 'Location Mismatch',
        severity: 'MEDIUM',
        score: 15,
        description: `Claim location (${claim.location}) differs from user location (${claim.userLocation})`,
        recommendation: 'Verify incident location and user address'
      });
      totalRiskScore += 15;
    }

    // Determine overall risk
    let overallRisk = 'LOW';
    if (totalRiskScore >= 60) overallRisk = 'CRITICAL';
    else if (totalRiskScore >= 40) overallRisk = 'HIGH';
    else if (totalRiskScore >= 20) overallRisk = 'MEDIUM';

    return {
      factors,
      totalRiskScore,
      overallRisk,
      riskBreakdown: {
        financial: factors.filter(f => f.factor.includes('Amount')).length > 0 ? 'HIGH' : 'LOW',
        behavioral: factors.filter(f => f.factor.includes('Frequency') || f.factor.includes('Timing')).length > 0 ? 'MEDIUM' : 'LOW',
        documentary: factors.filter(f => f.factor.includes('Document')).length > 0 ? 'MEDIUM' : 'LOW',
        geographic: factors.filter(f => f.factor.includes('Location')).length > 0 ? 'MEDIUM' : 'LOW'
      }
    };
  }

  generateInvestigationTimeline(claim, auditLogs, notes) {
    const timeline = [];

    // Claim submission
    if (claim.submittedDate) {
      timeline.push({
        timestamp: claim.submittedDate,
        event: 'Claim Submitted',
        type: 'SUBMISSION',
        details: `Claim ${claim.id || claim.claimId} submitted for ₹${(claim.amount || 0).toLocaleString()}`,
        icon: '📄'
      });
    }

    // Risk assessment
    if (claim.riskScore || claim.fraudScore) {
      timeline.push({
        timestamp: claim.assessedDate || claim.submittedDate,
        event: 'Risk Assessment',
        type: 'ASSESSMENT',
        details: `Risk score: ${claim.riskScore || claim.fraudScore}/100`,
        icon: '📊'
      });
    }

    // Audit logs
    auditLogs.forEach(log => {
      timeline.push({
        timestamp: log.timestamp,
        event: log.action,
        type: 'AUDIT',
        details: log.details,
        icon: '📝',
        user: log.user
      });
    });

    // Investigation notes
    notes.forEach(note => {
      timeline.push({
        timestamp: note.createdAt,
        event: 'Investigation Note',
        type: 'NOTE',
        details: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        icon: '💬',
        user: note.adminName || 'Admin'
      });
    });

    // Sort by timestamp
    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  generateInvestigationRecommendations(claim, riskAnalysis) {
    const recommendations = [];

    // Based on risk factors
    riskAnalysis.factors.forEach(factor => {
      recommendations.push({
        type: 'RISK_MITIGATION',
        priority: factor.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        action: factor.recommendation,
        reason: factor.description
      });
    });

    // General recommendations
    if (!claim.documentUrl || claim.documentUrl.includes('placeholder')) {
      recommendations.push({
        type: 'DOCUMENTATION',
        priority: 'HIGH',
        action: 'Request proper supporting documents',
        reason: 'Missing or insufficient documentation'
      });
    }

    if (claim.amount > 500000) {
      recommendations.push({
        type: 'VERIFICATION',
        priority: 'HIGH',
        action: 'Verify amount with third-party sources',
        reason: 'High claim amount requires additional verification'
      });
    }

    // Add timeline analysis recommendation
    recommendations.push({
      type: 'ANALYSIS',
      priority: 'MEDIUM',
      action: 'Review complete investigation timeline',
      reason: 'Timeline analysis can reveal patterns and inconsistencies'
    });

    return recommendations;
  }

  determineInvestigationPriority(claim, riskAnalysis) {
    if (riskAnalysis.overallRisk === 'CRITICAL') return 'IMMEDIATE';
    if (riskAnalysis.overallRisk === 'HIGH') return 'HIGH';
    if (riskAnalysis.overallRisk === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  }

  estimateInvestigationTime(claim, riskAnalysis) {
    // Estimate in hours based on complexity
    let baseHours = 2;
    
    if (riskAnalysis.overallRisk === 'CRITICAL') baseHours = 8;
    else if (riskAnalysis.overallRisk === 'HIGH') baseHours = 4;
    else if (riskAnalysis.overallRisk === 'MEDIUM') baseHours = 2;
    
    // Add time for document review
    if (claim.documentUrl) baseHours += 1;
    
    // Add time for high amount claims
    if (claim.amount > 500000) baseHours += 2;
    
    return `${baseHours} hours`;
  }

  // Investigation note management
  async addInvestigationNote(claimId, adminId, adminName, content, tags = []) {
    const notes = this.loadInvestigationNotes();
    
    const newNote = {
      id: Date.now().toString(),
      claimId,
      adminId,
      adminName,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.push(newNote);
    const saved = this.saveInvestigationNotes(notes);

    // Add to audit logs
    this.addAuditLog({
      action: 'INVESTIGATION_NOTE_ADDED',
      user: adminName,
      details: `Investigation note added for claim ${claimId}`,
      timestamp: new Date().toISOString()
    });

    return saved ? { success: true, note: newNote } : { success: false, error: 'Failed to save note' };
  }

  async updateInvestigationNote(noteId, updates) {
    const notes = this.loadInvestigationNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      return { success: false, error: 'Note not found' };
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const saved = this.saveInvestigationNotes(notes);
    return saved ? { success: true, note: notes[noteIndex] } : { success: false, error: 'Failed to update note' };
  }

  async getInvestigationNotes(claimId) {
    const notes = this.loadInvestigationNotes();
    return notes.filter(note => note.claimId === claimId);
  }

  // Tag management
  async addInvestigationTag(claimId, tag, color = '#3b82f6') {
    const notes = this.loadInvestigationNotes();
    const claimNotes = notes.filter(note => note.claimId === claimId);
    
    // Add tag to all notes for this claim
    claimNotes.forEach(note => {
      if (!note.tags.includes(tag)) {
        note.tags.push(tag);
      }
    });

    const saved = this.saveInvestigationNotes(notes);
    return saved ? { success: true } : { success: false, error: 'Failed to add tag' };
  }

  // Audit log management
  addAuditLog(logEntry) {
    const logs = this.loadAuditLogs();
    logs.unshift({
      id: Date.now(),
      ...logEntry
    });

    try {
      fs.writeFileSync(this.auditLogsPath, JSON.stringify(logs, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving audit log:', error);
      return false;
    }
  }

  // Generate investigation report
  async generateInvestigationReport(claimId) {
    const analysis = await this.analyzeClaimForInvestigation(claimId);
    
    if (!analysis.success) {
      return analysis;
    }

    const report = {
      reportId: `INV-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      claimId,
      claimSummary: {
        id: analysis.claim.id || analysis.claim.claimId,
        type: analysis.claim.claimType || analysis.claim.type,
        amount: analysis.claim.amount,
        user: analysis.claim.userName || analysis.claim.user,
        submittedDate: analysis.claim.submittedDate
      },
      investigationSummary: analysis.investigationSummary,
      riskAnalysis: analysis.riskAnalysis,
      timeline: analysis.timeline.slice(0, 10), // Last 10 events
      recommendations: analysis.recommendations,
      notesCount: analysis.notes.length,
      conclusion: this.generateInvestigationConclusion(analysis)
    };

    return {
      success: true,
      report,
      downloadUrl: `/api/investigation/reports/${report.reportId}.pdf` // Placeholder
    };
  }

  generateInvestigationConclusion(analysis) {
    const { overallRisk } = analysis.riskAnalysis;
    
    switch (overallRisk) {
      case 'CRITICAL':
        return 'HIGH RISK - Immediate investigation required. Multiple high-risk factors detected.';
      case 'HIGH':
        return 'MODERATE RISK - Detailed investigation recommended. Several risk factors present.';
      case 'MEDIUM':
        return 'LOW RISK - Standard investigation sufficient. Limited risk factors detected.';
      default:
        return 'MINIMAL RISK - Routine verification sufficient. No significant risk factors detected.';
    }
  }

  // Get investigation statistics
  getInvestigationStats() {
    const claims = this.loadClaims();
    const notes = this.loadInvestigationNotes();
    const auditLogs = this.loadAuditLogs();

    const highRiskClaims = claims.filter(c => c.riskScore >= 70 || c.fraudScore >= 70);
    const underInvestigation = claims.filter(c => c.status === 'UNDER_INVESTIGATION' || c.status === 'FRAUD_REVIEW');
    
    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return noteDate > thirtyDaysAgo;
    });

    return {
      totalClaims: claims.length,
      highRiskClaims: highRiskClaims.length,
      underInvestigation: underInvestigation.length,
      totalInvestigationNotes: notes.length,
      recentInvestigationNotes: recentNotes.length,
      totalAuditLogs: auditLogs.length,
      averageRiskScore: claims.reduce((sum, c) => sum + (c.riskScore || c.fraudScore || 0), 0) / claims.length || 0
    };
  }
}

// Create singleton instance
let investigationServiceInstance = null;

export function getInvestigationService() {
  if (!investigationServiceInstance) {
    investigationServiceInstance = new InvestigationService();
  }
  return investigationServiceInstance;
}

// Export individual functions for convenience
export async function analyzeClaim(claimId) {
  const service = getInvestigationService();
  return await service.analyzeClaimForInvestigation(claimId);
}

export async function addInvestigationNote(claimId, adminId, adminName, content, tags = []) {
  const service = getInvestigationService();
  return await service.addInvestigationNote(claimId, adminId, adminName, content, tags);
}

export async function getInvestigationNotes(claimId) {
  const service = getInvestigationService();
  return await service.getInvestigationNotes(claimId);
}

export async function generateInvestigationReport(claimId) {
  const service = getInvestigationService();
  return await service.generateInvestigationReport(claimId);
}

export function getInvestigationStats() {
  const service = getInvestigationService();
  return service.getInvestigationStats();
}