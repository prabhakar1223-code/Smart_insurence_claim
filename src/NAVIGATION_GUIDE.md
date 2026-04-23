# ClaimFlow - Navigation & Application Structure Guide

## Overview

ClaimFlow is a comprehensive Smart Insurance Claim Platform with three main sections:
1. **Landing Page** - Public marketing site
2. **User Portal** - Policy holder claim management
3. **Admin Dashboard** - Insurance operator claim processing

---

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Landing Page                         │
│  - Hero, Features, How It Works, Security, FAQ         │
│  - "Start Claim" button → Opens User Portal            │
└─────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
┌─────────────────────────────┐  ┌──────────────────────────┐
│      User Portal            │  │    Admin Dashboard       │
│  (Policy Holders)           │  │  (Insurance Operators)   │
└─────────────────────────────┘  └──────────────────────────┘
```

---

## 1. User Portal Flow

### Entry Point
- **Login** → OTP Authentication (`/components/user/UserLogin.tsx`)

### Main Navigation
All pages share `UserLayout.tsx` with consistent header/footer:

```
User Dashboard
├── Dashboard (Home)
│   ├── Active claims overview
│   ├── Quick stats (Active, Approved, Total Claimed)
│   ├── "Start New Claim" CTA
│   ├── Recent activity feed
│   └── Click claim → View Claim Status
│
├── My Claims
│   └── Same as Dashboard view
│
├── History
│   ├── All claims table (searchable/filterable)
│   ├── Status badges (Approved, Rejected, Pending)
│   └── Click claim → View Claim Status
│
├── Profile
│   ├── Personal information editor
│   ├── KYC document management
│   ├── Security settings (2FA, notifications)
│   └── Account summary
│
└── Notifications
    ├── Claim updates
    ├── Payment notifications
    ├── Document requests
    └── Notification preferences
```

### Claim Flow (Modal)

```
Start New Claim (Modal)
├── Step 1: Select Claim Type
│   └── Auto, Home, Health, Life
│
├── Step 2: Upload Documents
│   └── Camera capture or file upload
│
├── Step 3: Claim Details
│   ├── Incident date
│   ├── Location
│   ├── Description
│   └── Estimated amount
│
├── Step 4: Review
│   └── Confirm all details
│
└── Step 5: Submitted
    ├── Claim ID generated
    └── "View Dashboard" → Close modal
```

### Claim Status Page

Timeline-based view showing:
- Claim submitted
- Documents verified
- Under review (with progress indicator)
- Approval & payment

---

## 2. Admin Dashboard Flow

### Entry Point
- **Admin Login** → Email/Password (`/components/admin/AdminLogin.tsx`)

### Main Navigation
All pages share `AdminLayout.tsx` with sidebar:

```
Admin Dashboard
├── Dashboard (Home)
│   ├── KPI cards (Total Claims, Approval Rate, Avg Processing Time)
│   ├── Recent claims table
│   ├── Quick stats charts
│   └── Click claim → Claim Review
│
├── Claims Management
│   ├── All claims table (searchable/filterable)
│   ├── Status filters (All, Pending, Approved, Rejected)
│   ├── Bulk actions
│   └── Click claim → Claim Review
│
├── Claim Review
│   ├── Claim details panel
│   ├── Documents viewer
│   ├── Timeline of events
│   ├── OCR-extracted data
│   ├── Risk assessment
│   └── Approve/Reject/Request Info buttons
│
├── Fraud Detection
│   ├── High-risk claims flagged
│   ├── Duplicate detection
│   ├── Pattern analysis alerts
│   └── Investigation tools
│
├── User Management
│   ├── All policy holders table
│   ├── User status (Active, Pending, Suspended)
│   ├── KYC verification status
│   ├── Claims count per user
│   └── User actions (Edit, Delete)
│
├── Payments & Settlement
│   ├── All payments table
│   ├── Payment status tracking
│   ├── Total paid vs pending stats
│   ├── Payment methods
│   └── Settlement timeline
│
├── Reports & Analytics
│   ├── Claims trend chart (submitted, approved, rejected)
│   ├── Claims by type pie chart
│   ├── Payment trend line chart
│   ├── Processing time distribution
│   ├── Key insights panel
│   └── Export functionality
│
└── Settings
    └── System configuration (coming soon)
```

---

## 3. File Structure

```
/
├── App.tsx                           # Main app with view switcher
├── components/
│   ├── LandingPage.tsx              # Public marketing page
│   ├── UserApp.tsx                   # User portal router
│   ├── AdminApp.tsx                  # Admin dashboard router
│   │
│   ├── user/
│   │   ├── UserLayout.tsx           # User app shell (header, nav, footer)
│   │   ├── UserLogin.tsx            # OTP authentication
│   │   ├── UserDashboard.tsx        # User home/claims overview
│   │   ├── ClaimInterface.tsx       # Multi-step claim wizard (modal)
│   │   ├── ClaimStatus.tsx          # Claim detail & timeline view
│   │   ├── ClaimHistory.tsx         # All claims table
│   │   ├── UserProfile.tsx          # Profile & KYC management
│   │   └── Notifications.tsx        # Notification center
│   │
│   ├── admin/
│   │   ├── AdminLayout.tsx          # Admin app shell (sidebar, header)
│   │   ├── AdminLogin.tsx           # Email/password login
│   │   ├── AdminDashboard.tsx       # Admin home with KPIs
│   │   ├── ClaimsTable.tsx          # Claims management table
│   │   ├── ClaimReview.tsx          # Claim review & approval screen
│   │   ├── FraudAlerts.tsx          # Fraud detection interface
│   │   ├── UserManagement.tsx       # Policy holder management
│   │   ├── PaymentsSettlement.tsx   # Payment tracking
│   │   └── ReportsAnalytics.tsx     # Charts & analytics
│   │
│   └── landing/
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Security.tsx
│       └── FAQ.tsx
│
└── styles/
    └── globals.css                   # Dark theme design tokens
```

---

## 4. Navigation Patterns

### Landing → User Portal
1. User clicks "Start Claim" on landing page
2. Opens User Login (OTP)
3. After login → User Dashboard
4. Click "Start New Claim" → Modal opens
5. Complete wizard → Claim submitted
6. Modal shows success → "View Dashboard" closes modal

### User Dashboard → Claim Detail
1. Click any active claim card
2. Navigate to Claim Status page
3. Shows timeline, documents, actions
4. "Back to Dashboard" returns home

### Admin Dashboard → Claim Review
1. Click claim row in table
2. Navigate to Claim Review page
3. View full details, documents, timeline
4. Approve/Reject/Request Info
5. "Back to Claims" returns to table

### Cross-Navigation
- User and Admin are separate authenticated sessions
- No direct navigation between User and Admin
- Separate login flows and permissions

---

## 5. State Management

### User Portal State
```typescript
UserApp.tsx maintains:
- isLoggedIn: boolean
- userName: string
- currentPage: 'dashboard' | 'claims' | 'claim-status' | 'history' | 'profile' | 'notifications'
- showClaimModal: boolean
- selectedClaimId: string | null
```

### Admin Dashboard State
```typescript
AdminApp.tsx maintains:
- isLoggedIn: boolean
- currentPage: 'dashboard' | 'claims' | 'claim-review' | 'fraud' | 'users' | 'payments' | 'reports' | 'settings'
```

---

## 6. Component Props & Events

### UserDashboard
```typescript
interface Props {
  onStartClaim: () => void;        // Opens claim modal
  onViewClaim: (claimId: string) => void;  // Navigate to claim detail
}
```

### ClaimInterface (Modal)
```typescript
interface Props {
  onClose: () => void;  // Close modal and return to dashboard
}
```

### ClaimStatus
```typescript
interface Props {
  claimId: string;
  onBack: () => void;  // Return to dashboard
}
```

### ClaimHistory
```typescript
interface Props {
  onViewClaim: (claimId: string) => void;  // Navigate to claim detail
}
```

---

## 7. Mock Data

All pages use realistic mock data for demonstration:
- **Users**: John Doe, Jane Smith, Robert Johnson, etc.
- **Claims**: IDs like CLM-2024-8721, statuses, amounts
- **Payments**: Payment IDs, bank transfers, processing status
- **Analytics**: Monthly trends, type distribution, processing times

To replace with real data:
1. Create API service layer
2. Replace mock arrays with API calls
3. Add loading states
4. Handle errors

---

## 8. Responsive Design

- **Mobile-first**: User portal optimized for mobile (policy holders)
- **Desktop-first**: Admin dashboard optimized for desktop (data-heavy)
- **Breakpoints**: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- **Tables**: Desktop view on large screens, card view on mobile

---

## 9. Accessibility Features

- WCAG-compliant contrast ratios
- Keyboard navigation support
- Focus indicators on all interactive elements
- Semantic HTML (headings, labels, buttons)
- Screen reader labels (sr-only class when needed)
- Dark theme optimized for reduced eye strain

---

## 10. Next Steps for Production

### Backend Integration
1. Replace mock data with API endpoints
2. Implement real authentication (JWT, OAuth)
3. Add database persistence (claims, users, payments)
4. Implement file upload to cloud storage
5. Add OCR processing for documents

### Security
1. Implement proper session management
2. Add CSRF protection
3. Validate all inputs server-side
4. Encrypt sensitive data
5. Implement rate limiting

### Features to Add
1. Real-time notifications (WebSocket)
2. Email/SMS integration
3. Payment gateway integration
4. PDF export for claims
5. Advanced search/filtering
6. Audit logs
7. Role-based access control (RBAC)

---

## Quick Start for Developers

```bash
# View Landing Page
Click "Landing" in top-right menu

# Test User Portal
1. Click "User Portal" in menu
2. Enter any phone number (e.g., 5551234567)
3. Fill in OTP fields (any 6 digits)
4. Explore dashboard, claims, profile

# Test Admin Dashboard
1. Click "Admin" in menu
2. Enter any email/password
3. Explore claims table, review, analytics

# View Design System
Click "Design System" or "Components" in menu
```

---

## Support & Documentation

- **Design System**: See `/styles/globals.css` for color tokens
- **Components**: See `/components/design-system/ComponentShowcase.tsx`
- **Developer Handoff**: View in-app "Handoff Docs"
- **Guidelines**: See `/guidelines/Guidelines.md`

---

Built with React, TypeScript, Tailwind CSS v4, and Recharts for analytics.
