# CLAIM DECISION ENGINE & FRAUD WORKFLOW UPGRADE - IMPLEMENTATION PLAN

## Overview
This document outlines the comprehensive upgrade plan for the Smart Insurance Claim platform's claim decision engine and fraud workflow. The plan covers 6 phases as requested by the user.

## Phase 1: Claim Decision Engine (Auto Routing)

### Current State Analysis
- Current decision logic in `backend/controllers/claimController.js` uses thresholds: <20 AUTO_APPROVE, <40 FAST_TRACK, <60 STANDARD_REVIEW, <80 ENHANCED_REVIEW, else FRAUD_INVESTIGATION
- Alternative decision logic in `services/fraudService.js` uses: ≥70 REJECTED, >50 FRAUD_ALERT, ≥35 MANUAL_REVIEW, else APPROVED

### New Auto-Routing Design
```
Risk Score Range → Decision
0-20 → AUTO_APPROVE (Instant approval, no human review)
21-35 → FAST_TRACK (Quick admin review, priority queue)
36-50 → STANDARD_REVIEW (Normal admin review queue)
51-75 → ENHANCED_REVIEW (Senior admin + fraud team)
76-100 → AUTO_REJECT (Instant rejection, fraud investigation)
```

### Implementation Tasks
1. **Update `claimController.js`** - Modify `generateValidationDecision()` function
2. **Update `fraudService.js`** - Align decision logic with new thresholds
3. **Add routing metadata** - Store routing decision in claim data
4. **Create priority queues** - Implement different review queues in admin dashboard

## Phase 2: Improved Risk Scoring Engine

### Current State Analysis
- Two risk scoring implementations exist: `backend/services/riskService.js` and `services/fraudService.js`
- Current scoring uses 9 factors with varying weights
- No standardized weighted scoring model

### New Weighted Scoring Model (10 Factors)
1. **Claim Amount Anomaly** (+30) - Amount > 2x user average or >150k
2. **Frequency Burst** (+25) - >2 claims in last 30 days
3. **Duplicate Incident Location** (+20) - Same location across multiple users
4. **Same Doctor/Repair Shop Repetition** (+20) - Same professional across claims
5. **Policy Fresh Activation** (+20) - First claim within 30 days of policy start
6. **OCR Mismatch** (+35) - Extracted amount differs from user input by >10%
7. **Vehicle Mismatch** (+40) - Uploaded vehicle doesn't match policy vehicle
8. **Tampered Document Detection** (+40) - AI detects document manipulation
9. **Previous Fraud History** (+30) - User has rejected/fraudulent claims
10. **Image Confidence Low** (+15) - OCR/damage detection confidence <60%

### Implementation Tasks
1. **Create unified scoring service** - New `services/advancedRiskService.js`
2. **Update scoring factors** - Implement all 10 weighted factors
3. **Add risk reasons array** - Store detailed explanations for each factor
4. **Integrate with decision engine** - Connect scoring to auto-routing
5. **Update frontend display** - Show detailed risk breakdown in UI

## Phase 3: OCR Extraction Improvements

### Current State Analysis
- OCR service in `backend/services/ocrService.js` uses Tesseract.js
- Extraction patterns for amounts, policy numbers, dates, and names
- Document-type specific extraction (vehicle, health, home, life)

### Enhanced OCR Features
1. **Multi-format amount detection** - Support ₹, Rs, INR, $ formats
2. **Policy number validation** - Check against policy database
3. **Date normalization** - Convert all date formats to ISO
4. **Vehicle-specific extraction** - VIN, registration, make/model
5. **Health-specific extraction** - Hospital, doctor, diagnosis codes
6. **Home-specific extraction** - Address, property details
7. **Life-specific extraction** - Beneficiary, cause of death
8. **Confidence scoring** - Measure extraction accuracy
9. **Field validation** - Cross-check extracted fields
10. **Tampering detection** - Identify document manipulation

### Implementation Tasks
1. **Enhance `ocrService.js`** - Add new extraction patterns
2. **Add confidence scoring** - Implement accuracy metrics
3. **Create field validation** - Cross-reference extracted data
4. **Add tampering detection** - Basic image analysis
5. **Update frontend OCR service** - Enhanced result display

## Phase 4: Admin Investigation System

### Current State Analysis
- Investigation UI in `src/components/admin/ClaimInvestigation.tsx`
- Basic risk explanation and severity assessment
- Limited investigation tools

### Enhanced Investigation Features
1. **Timeline visualization** - Claim submission and review timeline
2. **Evidence comparison** - Side-by-side document comparison
3. **Pattern detection** - Identify suspicious patterns across claims
4. **User history view** - Complete claim history for user
5. **Location mapping** - Geographic visualization of claims
6. **Professional network** - Doctor/repair shop connections
7. **Risk factor drill-down** - Detailed analysis of each risk factor
8. **Collaboration tools** - Notes and team assignment
9. **Decision audit trail** - Track all investigation actions
10. **Export capabilities** - Generate investigation reports

### Implementation Tasks
1. **Enhance `ClaimInvestigation.tsx`** - Add new investigation features
2. **Create timeline component** - Visual timeline of claim events
3. **Add evidence comparison** - Document side-by-side view
4. **Implement pattern detection** - Cross-claim analysis
5. **Create reporting system** - Generate PDF investigation reports

## Phase 5: User Notifications

### Current State Analysis
- Notification system in `server.js` with `sendSmartNotification()`
- Email and in-app notifications
- Basic notification types

### Enhanced Notification System
1. **Real-time WebSocket updates** - Instant claim status changes
2. **Multi-channel notifications** - Email, SMS, in-app, push
3. **Notification templates** - Customizable message templates
4. **User preferences** - Allow users to choose notification channels
5. **Notification scheduling** - Timed and conditional notifications
6. **Notification analytics** - Track delivery and engagement
7. **Notification categories** - Claim status, fraud alerts, policy updates
8. **Localization support** - Multi-language notifications
9. **Rich media notifications** - Include images and documents
10. **Notification history** - Archive of all notifications

### Implementation Tasks
1. **Enhance notification service** - Add new notification types
2. **Create notification templates** - HTML/plain text templates
3. **Add user preferences** - Notification channel selection
4. **Implement WebSocket updates** - Real-time frontend updates
5. **Create notification analytics** - Track and report on notifications

## Phase 6: Database Schema Updates

### Current Schema Analysis
- Claims stored in `data/claims.json` with basic fields
- Missing fields for enhanced risk scoring and investigation

### New Schema Requirements
1. **Risk scoring details** - Store all risk factors and scores
2. **Investigation metadata** - Admin notes, decisions, audit trail
3. **Notification history** - All notifications sent for claim
4. **Document references** - Links to uploaded documents
5. **Timeline events** - All claim lifecycle events
6. **User behavior patterns** - Historical claim patterns
7. **Location data** - Geographic coordinates
8. **Professional references** - Doctor/repair shop details
9. **Policy information** - Policy details and limits
10. **Fraud investigation results** - Investigation findings

### Implementation Tasks
1. **Update `claims.json` schema** - Add new fields
2. **Create migration script** - Update existing claims
3. **Add data validation** - Ensure data integrity
4. **Create backup system** - Regular data backups
5. **Implement data archiving** - Archive old claims

## Implementation Priority & Timeline

### Priority 1 (Core Engine)
1. Update claim decision engine (Phase 1)
2. Implement improved risk scoring (Phase 2)
3. Update database schema (Phase 6)

### Priority 2 (User Experience)
1. Enhance OCR extraction (Phase 3)
2. Improve user notifications (Phase 5)

### Priority 3 (Admin Tools)
1. Upgrade admin investigation system (Phase 4)

## Technical Dependencies
- **Backend**: Node.js, Express, Tesseract.js, Socket.IO
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: JSON files (consider migration to SQLite for production)
- **AI/ML**: Existing damage/vehicle validation services

## Risk Mitigation
1. **Backward compatibility** - Maintain existing API endpoints
2. **Data migration** - Test migration scripts thoroughly
3. **Performance impact** - Monitor system performance during rollout
4. **User training** - Provide admin training for new features
5. **Rollback plan** - Have backup of current system

## Success Metrics
1. **Auto-approval rate** - Target: 40% of claims auto-approved
2. **Fraud detection accuracy** - Target: 95% fraud detection rate
3. **Review time reduction** - Target: 50% faster claim processing
4. **User satisfaction** - Target: 90% user satisfaction score
5. **Admin efficiency** - Target: 60% reduction in manual review time

## Next Steps
1. Review and approve this implementation plan
2. Switch to Code mode for implementation
3. Implement Priority 1 features first
4. Test thoroughly before moving to Priority 2
5. Deploy incrementally with monitoring

---
*Last Updated: 2026-04-26*
*Architect: Roo*