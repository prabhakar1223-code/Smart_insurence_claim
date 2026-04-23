import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, FileText, Clock, CheckCircle, Download, AlertTriangle, IndianRupee } from 'lucide-react';

interface ReportsAnalyticsProps {
  stats?: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function ReportsAnalytics({ stats }: ReportsAnalyticsProps) {
  const total = stats?.total ?? 0;
  const approved = stats?.approved ?? 0;
  const rejected = stats?.rejected ?? 0;
  const pending = stats?.pending ?? 0;
  const highRisk = stats?.highRisk ?? 0;
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Claims', value: String(total), icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'High Risk', value: String(highRisk), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Pending Review', value: String(pending), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  // Claim type distribution data
  const typeData = (stats?.claimTypeDistribution || []).map((item: any, i: number) => ({
    ...item,
    color: COLORS[i % COLORS.length]
  }));

  // Risk score distribution
  const riskData = stats?.riskDistribution || [];

  // Status distribution
  const statusData = stats?.statusDistribution || [];

  const isEmpty = total === 0;

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEmpty ? 'Submit claims to see analytics.' : 'Live insights from submitted claims.'}
          </p>
        </div>
        <a
          href="http://localhost:3000/admin/export-csv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium self-start sm:self-auto"
        >
          <Download size={16} /> Export Report
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {isEmpty ? (
        <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
          <FileText className="mx-auto mb-3 text-muted-foreground" size={40} />
          <p className="text-foreground font-medium mb-1">No Data Yet</p>
          <p className="text-muted-foreground text-sm">Submit claims from the user portal to see charts and analytics.</p>
        </div>
      ) : (
        /* Charts Grid */
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Risk Score Distribution */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-card">
            <h2 className="text-base sm:text-lg font-semibold mb-1">Risk Score Distribution</h2>
            <p className="text-xs text-muted-foreground mb-4">Claims grouped by fraud risk level</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141823',
                    border: '1px solid #1e293b',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9',
                    fontSize: 12
                  }}
                />
                <Bar dataKey="count" name="Claims" radius={[4, 4, 0, 0]}>
                  {riskData.map((_: any, index: number) => (
                    <Cell key={index} fill={index >= 3 ? '#ef4444' : index >= 2 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Claim Type Distribution */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-card">
            <h2 className="text-base sm:text-lg font-semibold mb-1">Claims by Type</h2>
            <p className="text-xs text-muted-foreground mb-4">Distribution across insurance categories</p>
            {typeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141823',
                        border: '1px solid #1e293b',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9',
                        fontSize: 12
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {typeData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="text-muted-foreground capitalize truncate">{item.name}</span>
                      <span className="font-semibold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No type data available.</p>
            )}
          </div>

          {/* Status Overview */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-card">
            <h2 className="text-base sm:text-lg font-semibold mb-1">Status Overview</h2>
            <p className="text-xs text-muted-foreground mb-4">Current claim processing status</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {statusData.map((item: any, index: number) => (
                <div key={index} className="bg-muted/20 border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '20' }}>
                    {item.name === 'Approved' && <CheckCircle size={24} style={{ color: item.color }} />}
                    {item.name === 'Manual Review' && <Clock size={24} style={{ color: item.color }} />}
                    {item.name === 'Rejected' && <TrendingDown size={24} style={{ color: item.color }} />}
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-sm font-semibold text-foreground">
                      {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
