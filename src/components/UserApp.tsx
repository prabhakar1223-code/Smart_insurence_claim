import React, { useState, useEffect } from 'react';
import { calculateFraudScore } from '../utils/fraudEngine';

import { UserLogin } from './user/UserLogin';
import { UserLayout } from './user/UserLayout';
import { UserDashboard } from './user/UserDashboard';
import { ClaimInterface } from './user/ClaimInterface';
import { ClaimStatus } from './user/ClaimStatus';
import { ClaimHistory } from './user/ClaimHistory';
import { UserProfile } from './user/UserProfile';
import { Notifications } from './user/Notifications';
import { MyClaims } from './user/MyClaims';
import { InsuranceStatus } from './user/InsuranceStatus';
import { InsuranceApplicationForm, ApplicationFormData } from './user/InsuranceApplicationForm';
import { ApplicationStatus, ApplicationData } from './user/ApplicationStatus';

type Page =
  | 'dashboard'
  | 'claims'
  | 'claim-status'
  | 'history'
  | 'profile'
  | 'notifications'
  | 'my-claims'
  | 'insurance-status'
  | 'application-status'
  | 'new-application';

import { AuthProvider, useAuth } from '../context/AuthContext';

interface ClaimData {
  claimId: string;
  validationData: {
    status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    issues?: string[];
    extractedData?: any;
    claimType: string;
    amount: string;
    submittedDate: string;
  };
  fraudScore?: number;
  fraudSeverity?: string;
  fraudFlags?: string[];
}

interface UserAppProps {
  onLogout: () => void;
}

function UserAppContent({ onLogout }: UserAppProps) {
  const { isLoggedIn, user, login, logout } = useAuth();
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [claimsData, setClaimsData] = useState<Map<string, ClaimData>>(new Map());
  const [applications, setApplications] = useState<ApplicationData[]>([]);

  useEffect(() => {
    if (isLoggedIn && userName) {
      const interval = setInterval(() => {
        fetchApplications(userEmail);
        fetchClaims(userName);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, userName, userEmail]);

  const handleLogin = (token: string, userData: any) => {
    login(token, userData);
    fetchApplications(userData.email, token);
    fetchClaims(userData.name, token);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard');
    onLogout();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedClaimId(null);
  };

  const handleStartClaim = () => setShowClaimModal(true);
  const handleCloseClaimModal = () => setShowClaimModal(false);

  const handleViewClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    setCurrentPage('claim-status');
  };

  // ============================
  // 🔥 FRAUD-INTEGRATED CLAIM SUBMISSION
  // ============================

  const handleClaimSubmitted = async (claimData: {
    claimId: string;
    validationResponse: any;
    claimType: string;
    amount: string;
  }) => {

    // 🔥 Calculate Fraud Score
    const fraudResult = calculateFraudScore({
      amount: Number(claimData.amount),
      userPreviousClaims: claimsData.size,
      validationStatus:
        claimData.validationResponse.validation?.status || "MANUAL_REVIEW",
    });

    const newClaimData: ClaimData = {
      claimId: claimData.claimId,
      validationData: {
        status:
          claimData.validationResponse.validation?.status || 'MANUAL_REVIEW',
        issues:
          claimData.validationResponse.validation?.issues || [],
        extractedData: claimData.validationResponse.data,
        claimType: claimData.claimType,
        amount: `₹${claimData.amount}`,
        submittedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      },
      fraudScore: fraudResult.riskScore,
      fraudSeverity: fraudResult.severity,
      fraudFlags: fraudResult.flags
    };

    try {
      const token = localStorage.getItem('jwt_token');
      await fetch('http://localhost:3000/submit-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: userName,
          userEmail: userEmail,
          claimType: claimData.claimType,
          amount: claimData.amount,
          validationStatus:
            claimData.validationResponse.validation?.status || 'MANUAL_REVIEW',
          issues:
            claimData.validationResponse.validation?.issues || [],
          extractedData: claimData.validationResponse.data,

          // 🔥 Send Fraud Data To Backend
          fraudScore: fraudResult.riskScore,
          fraudSeverity: fraudResult.severity,
          fraudFlags: fraudResult.flags
        })
      });
    } catch (error) {
      console.error('Failed to submit claim:', error);
    }

    setClaimsData(prev => {
      const updated = new Map(prev);
      updated.set(claimData.claimId, newClaimData);
      return updated;
    });

    setSelectedClaimId(null);
    setCurrentPage('dashboard');
    setShowClaimModal(false);

    await fetchClaims(userName);
  };

  // ============================
  // 🔥 POLICY SUBMISSION
  // ============================
  const handlePolicySubmit = async (formData: any) => {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch('http://localhost:3000/submit-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, userName: userName })
      });
      alert('Your new insurance policy has been successfully issued! You can now start new claims under it.');
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Failed to submit policy", error);
    }
  };

  // ============================
  // FETCH CLAIMS
  // ============================

  const fetchClaims = async (fetchUserName?: string, token?: string) => {
    const targetName = fetchUserName || userName;
    const targetToken = token || localStorage.getItem('jwt_token');
    if (!targetToken) return;

    try {
      // Using protected user claims route
      const response = await fetch(
        `http://localhost:3000/get-user-claims`, {
        headers: { 'Authorization': `Bearer ${targetToken}` }
      }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (data.success && data.claims) {
        const claimsMap = new Map();

        data.claims.forEach((claim: any) => {
          claimsMap.set(claim.id, {
            claimId: claim.id,
            validationData: {
              status: claim.status,
              issues: claim.issues || [],
              extractedData: claim.extractedData,
              claimType: claim.claimType,
              amount: claim.amount,
              submittedDate: new Date(
                claim.submittedDate
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
            },
            fraudScore: claim.fraudScore,
            fraudSeverity: claim.fraudSeverity,
            fraudFlags: claim.fraudFlags
          });
        });

        setClaimsData(claimsMap);
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    }
  };

  const fetchApplications = async (email: string, token?: string) => {
    try {
      const targetToken = token || localStorage.getItem('jwt_token');
      const response = await fetch(
        `http://localhost:3000/applications?email=${email}`, {
        headers: targetToken ? { 'Authorization': `Bearer ${targetToken}` } : undefined
      }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  if (!isLoggedIn) {
    return <UserLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <UserDashboard
            onStartClaim={handleStartClaim}
            onViewClaim={handleViewClaim}
            onStartApplication={() => setCurrentPage('new-application')}
          />
        );
      case 'new-application':
        return <InsuranceApplicationForm onSubmit={handlePolicySubmit} onCancel={() => setCurrentPage('dashboard')} />;
      case 'my-claims':
        return <MyClaims claimsData={Array.from(claimsData.values())} onViewClaim={handleViewClaim} />;
      case 'insurance-status':
        return <InsuranceStatus />;
      case 'application-status':
        return (
          <ApplicationStatus
            applications={applications}
            onViewDetails={(id) => {
              // Implementation for viewing application details if needed
              console.log("Viewing application", id);
            }}
          />
        );
      case 'history':
        return (
          <ClaimHistory
            claimsData={Array.from(claimsData.values())}
            onViewClaim={handleViewClaim}
          />
        );
      case 'profile':
        return <UserProfile />;
      default:
        return (
          <UserDashboard
            onStartClaim={handleStartClaim}
            onViewClaim={handleViewClaim}
            onStartApplication={() => setCurrentPage('new-application')}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <UserLogin onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <>
      <UserLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={userName}
      >
        {renderPage()}
      </UserLayout>

      {showClaimModal && (
        <ClaimInterface
          onClose={handleCloseClaimModal}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}
    </>
  );
}

export function UserApp({ onLogout }: UserAppProps) {
  return (
    <AuthProvider>
      <UserAppContent onLogout={onLogout} />
    </AuthProvider>
  );
}
