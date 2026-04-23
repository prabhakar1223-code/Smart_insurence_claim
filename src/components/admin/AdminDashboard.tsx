import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  IndianRupee,
  Map,
  Activity,
  History
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
  claims?: any[];
  stats?: any;
}

export function AdminDashboard({ onNavigate, claims = [], stats }: AdminDashboardProps) {
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/admin/heatmap').then(r => r.json()).then(d => setHeatmap(d.heatmap || []));
    fetch('http://localhost:3000/admin/audit-logs').then(r => r.json()).then(d => setAuditLogs(d.logs || []));
  }, []);

  const total = stats?.total ?? claims.length;
  const approved = stats?.approved ?? claims.filter((c: any) => c.status === 'APPROVED').length;
  const rejected = stats?.rejected ?? claims.filter((c: any) => c.status === 'REJECTED').length;
  const pending = stats?.pending ?? claims.filter((c: any) => c.status === 'MANUAL_REVIEW' || c.status === 'pending' || c.status === 'reviewing').length;
  const highRisk = stats?.highRisk ?? claims.filter((c: any) => (c.fraudScore || 0) >= 70).length;

  // Compute SLA (Part 14) 
  // Simplified: % of claims reviewed within 24h of submission
  const slaClaims = claims.filter(c => c.reviewedDate);
  const slaMet = slaClaims.filter(c => {
    const diff = new Date(c.reviewedDate).getTime() - new Date(c.submittedDate).getTime();
    return diff < 86400000; // 24h
  }).length;
  const slaPercent = slaClaims.length > 0 ? Math.round((slaMet / slaClaims.length) * 100) : 100;

  const kpis = [
    { title: 'Total Claims', value: total, icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
    { title: 'Approved', value: approved, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { title: 'Processing SLA', value: `${slaPercent}%`, icon: Activity, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    { title: 'High Risk', value: highRisk, icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    { title: 'Audit Trail', value: auditLogs.length, icon: History, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  ];

  const statusData = stats?.statusDistribution || [
    { name: 'Approved', value: approved, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Rejected', value: rejected, color: '#ef4444' },
  ];

  const recentClaims = stats?.recentClaims || [...claims]
    .sort((a: any, b: any) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
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
    return status || 'Pending';
  };

  const isEmpty = total === 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Fraud Intelligence</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {isEmpty ? 'Awaiting incoming claims...' : 'Real-time monitoring of global risk patterns.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <a
            href="http://localhost:3000/admin/export-csv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl transition-all hover:bg-accent border border-border font-bold text-xs"
          >
            <FileText size={14} /> EXPORT CSV
          </a>
          <button
            onClick={() => onNavigate && onNavigate('claims')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl transition-all hover:opacity-90 font-bold text-xs shadow-lg shadow-primary/20"
          >
            MANAGE QUEUE
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border`} style={{ background: kpi.bg, borderColor: kpi.border }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{kpi.title}</p>
            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Risk Analytics Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Fraud Risk Trends</h3>
                <p className="text-xs text-muted-foreground mt-1 tracking-tight">AI Confidence Score Distribution</p>
              </div>
              <TrendingUp size={20} className="text-primary opacity-50" />
            </div>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.riskDistribution || []}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="range" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 10, fontWeight: '700' }} />
                  <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" name="Total Claims" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Part 11: Fraud Heatmap */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Geospatial Fraud Heatmap</h3>
                <p className="text-xs text-muted-foreground mt-1 tracking-tight">Active incident frequency by location</p>
              </div>
              <Map size={20} className="text-primary opacity-50" />
            </div>
            <div className="h-[250px] flex items-center justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {heatmap.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border bg-muted/5 flex flex-col items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.frequencyScore > 0.7 ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                    <span className="text-xs font-bold truncate w-full text-center">{item.location}</span>
                    <span className="text-lg font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Side Panels */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Queue Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData.filter((d: any) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: '700' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-6">
              {statusData.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-muted-foreground uppercase">{item.name}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Activity</h4>
              <History size={14} className="text-muted-foreground" />
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {auditLogs.slice(0, 10).map((log, idx) => (
                <div key={idx} className="flex gap-3 text-xs border-l-2 border-primary/20 pl-3 py-1">
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <span className="text-primary">[{log.action}]</span>
                      <span className="opacity-50">•</span>
                      <span>{log.user}</span>
                    </p>
                    <p className="opacity-70 leading-relaxed font-medium">{log.details}</p>
                    <p className="text-[10px] opacity-40 font-mono italic">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-xs text-muted-foreground text-center py-8 italic font-medium">No activity recorded yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims Section */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Investigative Queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium italic">Priority claims requiring human verification</p>
          </div>
          <button onClick={() => onNavigate && onNavigate('claims')} className="text-primary font-bold text-xs flex items-center gap-2 hover:translate-x-1 transition-transform">
            VIEW QUEUE <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/10">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocol#</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Policy Holder</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Claim Amount</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">AI Score</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentClaims.map((claim: any, index: number) => (
                <tr key={index} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">{claim.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm tracking-tight">{claim.userName || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-sm">₹{Number(claim.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className={`px-3 py-1 rounded-full text-[11px] font-black border ${(claim.fraudScore || 0) >= 70 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          (claim.fraudScore || 0) >= 30 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                        {claim.fraudScore ?? 0}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${getStatusBadge(claim.status)}`}>
                      {getStatusLabel(claim.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}