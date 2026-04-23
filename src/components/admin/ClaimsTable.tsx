import React, { useState } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock, ChevronDown, ShieldAlert, ShieldCheck, AlertTriangle, IndianRupee, Loader2, X, FileText } from 'lucide-react';
import { ClaimInvestigation } from './ClaimInvestigation';

interface ClaimsTableProps {
  claims?: any[];
  onUpdateStatus?: (claimId: string, status: string, notes?: string, markedAsFraud?: boolean) => Promise<void>;
  onSelectClaim?: (claim: any) => void;
}

export function ClaimsTable({ claims = [], onUpdateStatus, onSelectClaim }: ClaimsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Apply filters locally
  let filtered = [...claims];

  if (statusFilter !== 'all') {
    filtered = filtered.filter(c => c.status?.toUpperCase() === statusFilter.toUpperCase());
  }

  if (riskFilter === 'high') {
    filtered = filtered.filter(c => (c.fraudScore || 0) >= 70);
  } else if (riskFilter === 'medium') {
    filtered = filtered.filter(c => (c.fraudScore || 0) >= 30 && (c.fraudScore || 0) < 70);
  } else if (riskFilter === 'low') {
    filtered = filtered.filter(c => (c.fraudScore || 0) < 30);
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      (c.id || '').toLowerCase().includes(q) ||
      (c.userName || '').toLowerCase().includes(q) ||
      (c.userEmail || '').toLowerCase().includes(q)
    );
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const handleQuickAction = async (claimId: string, status: string) => {
    if (!onUpdateStatus) return;
    setActionLoading(claimId);
    await onUpdateStatus(claimId, status);
    setActionLoading(null);
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return <CheckCircle className="text-emerald-400" size={14} />;
    if (s === 'REJECTED') return <XCircle className="text-red-400" size={14} />;
    return <Clock className="text-amber-400" size={14} />;
  };

  const getStatusClass = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (s === 'REJECTED') return 'bg-red-500/15 text-red-400 border-red-500/20';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  };

  const getStatusLabel = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'Approved';
    if (s === 'REJECTED') return 'Rejected';
    if (s === 'MANUAL_REVIEW') return 'Review';
    if (s === 'REVIEWING') return 'Investigating';
    if (s === 'BLOCKED') return 'Blocked';
    return status || 'Pending';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
        <ShieldAlert size={12} /> {score}
      </span>
    );
    if (score >= 30) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400">
        <AlertTriangle size={12} /> {score}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
        <ShieldCheck size={12} /> {score}
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Claims Processing</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filtered.length} claim{filtered.length !== 1 ? 's' : ''} {searchTerm || statusFilter !== 'all' || riskFilter !== 'all' ? '(filtered)' : 'total'}
          </p>
        </div>
        <a
          href="http://localhost:3000/admin/export-csv"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card text-foreground px-4 py-2 rounded-lg border border-border shadow-sm hover:bg-muted transition-all flex items-center gap-2 text-sm font-medium self-start sm:self-auto"
        >
          <Download size={16} /> Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Claim ID or User..."
              className="w-full bg-background border border-input pl-9 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-3 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-background border border-input px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="MANUAL_REVIEW">⏳ Manual Review</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="REJECTED">❌ Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          </div>

          {/* Risk Filter */}
          <div className="lg:col-span-3 relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-background border border-input px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">🔴 High Risk (≥70)</option>
              <option value="medium">🟡 Medium (30-69)</option>
              <option value="low">🟢 Low Risk (&lt;30)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FileText className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-muted-foreground text-sm">
              {claims.length === 0 ? 'No claims submitted yet.' : 'No claims match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Claim</th>
                  <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Type</th>
                  <th className="px-4 sm:px-6 py-3">Amount</th>
                  <th className="px-4 sm:px-6 py-3">Risk</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((claim) => (
                  <tr key={claim.id} className="group hover:bg-muted/30 transition-colors">
                    {/* Claim ID + User */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-medium text-primary text-xs">{claim.id}</span>
                        <span className="text-sm text-foreground truncate max-w-[100px] sm:max-w-[140px]">{claim.userName || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="text-sm capitalize text-muted-foreground">{claim.claimType || claim.insuranceType || '-'}</span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 sm:px-6 py-3 font-semibold text-foreground">
                      <span className="flex items-center gap-0.5">
                        <IndianRupee size={13} />
                        {Number(claim.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 sm:px-6 py-3">
                      {getRiskBadge(claim.fraudScore || 0)}
                    </td>

                    {/* Status */}
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        {getStatusLabel(claim.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Investigate */}
                        <button
                          onClick={() => onSelectClaim?.(claim)}
                          className="p-1.5 bg-background border border-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Investigate"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Quick actions for non-finalized statuses */}
                        {(claim.status?.toUpperCase() !== 'APPROVED' && claim.status?.toUpperCase() !== 'REJECTED') && (
                          <>
                            <button
                              onClick={() => handleQuickAction(claim.id, 'APPROVED')}
                              disabled={actionLoading === claim.id}
                              className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === claim.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                            </button>
                            <button
                              onClick={() => handleQuickAction(claim.id, 'REJECTED')}
                              disabled={actionLoading === claim.id}
                              className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-border px-4 sm:px-6 py-3 bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of <span className="font-medium text-foreground">{claims.length}</span> claims
            </p>
          </div>
        )}
      </div>

      {/* Modal removed - now using page-level review */}
    </div>
  );
}