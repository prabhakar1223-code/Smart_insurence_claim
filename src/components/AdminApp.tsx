import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { ClaimsTable } from './admin/ClaimsTable';
import { ClaimReview } from './admin/ClaimReview';
import { FraudAlerts } from './admin/FraudAlerts';
import { UserManagement } from './admin/UserManagement';
import { PaymentsSettlement } from './admin/PaymentsSettlement';
import { ReportsAnalytics } from './admin/ReportsAnalytics';
import { ApplicationReview } from './admin/ApplicationReview';
import { ClaimsApplicationsManager } from './admin/ClaimsApplicationsManager';
import { ApplicationData } from './user/ApplicationStatus';

type Page = 'dashboard' | 'claims' | 'claim-review' | 'fraud' | 'users' | 'payments' | 'reports' | 'settings' | 'applications' | 'manage-all';

interface AdminAppProps {
  onLogout: () => void;
}

export function AdminApp({ onLogout }: AdminAppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/applications');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      // applications endpoint may not exist yet, silently fail
    }
  }, []);

  const fetchClaims = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/claims');
      const data = await response.json();
      if (data.success) {
        setClaims(data.claims);
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchApplications();
    fetchClaims();
    fetchStats();
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Real-time Sockets (Part 16)
      const socket = io('http://localhost:3000');

      socket.on('new_claim_alert', (data) => {
        toast.error(data.message, {
          description: `Risk Score: ${data.riskScore}% | User: ${data.user}`,
          duration: 10000,
        });
        fetchClaims();
        fetchStats();
      });

      const interval = setInterval(() => {
        fetchApplications();
        fetchClaims();
        fetchStats();
      }, 10000); // Polling as fallback, increased to 10s to reduce load

      return () => {
        socket.disconnect();
        clearInterval(interval);
      };
    }
  }, [isLoggedIn, fetchApplications, fetchClaims, fetchStats]);

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        await fetchApplications();
      }
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string, reason: string, requiredInfo: string[]) => {
    try {
      const response = await fetch(`http://localhost:3000/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, requiredInformation: requiredInfo })
      });
      const data = await response.json();
      if (data.success) {
        await fetchApplications();
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: string, notes?: string, markedAsFraud?: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/claims/${claimId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes, markedAsFraud })
      });
      const data = await response.json();
      if (data.success) {
        await fetchClaims();
        await fetchStats();
        toast.success(`Claim ${claimId} updated successfully`);
      }
    } catch (error) {
      console.error('Failed to update claim status:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    onLogout();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} claims={claims} stats={stats} />;
      case 'claims':
        return <ClaimsTable claims={claims} onUpdateStatus={handleUpdateClaimStatus} onSelectClaim={(c) => { setSelectedClaim(c); setCurrentPage('claim-review'); }} />;
      case 'claim-review':
        return <ClaimReview claim={selectedClaim} onBack={() => { setSelectedClaim(null); setCurrentPage('claims'); }} onUpdateStatus={handleUpdateClaimStatus} />;
      case 'fraud':
        return <FraudAlerts claims={claims} onUpdateStatus={handleUpdateClaimStatus} />;
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentsSettlement />;
      case 'reports':
        return <ReportsAnalytics stats={stats} />;
      case 'applications':
        return <ApplicationReview applications={applications} onApprove={handleApproveApplication} onReject={handleRejectApplication} />;
      case 'manage-all':
        return <ClaimsApplicationsManager claims={claims} applications={applications} onUpdateClaimStatus={handleUpdateClaimStatus} onApproveApplication={handleApproveApplication} onRejectApplication={handleRejectApplication} onLogout={handleLogout} />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground mt-2">Audit logs and system parameters coming here soon.</p>
          </div>
        );
      default:
        return <AdminDashboard onNavigate={handleNavigate} claims={claims} stats={stats} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
}