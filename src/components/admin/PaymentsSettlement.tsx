import React, { useState } from 'react';
import { IndianRupee, TrendingUp, Clock, CheckCircle, Search, Filter, Download, CreditCard, ArrowUpRight } from 'lucide-react';

export function PaymentsSettlement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 👇 CHANGED: Indian Names & Payment Methods (UPI, NEFT)
  const payments = [
    {
      id: 'PAY-2024-1543',
      claimId: 'CLM-2024-8721',
      userName: 'Rahul Sharma',
      amount: 5250.0,
      status: 'processing',
      method: 'UPI Transfer',
      initiatedDate: 'Dec 10, 2024',
      completedDate: null,
    },
    {
      id: 'PAY-2024-1542',
      claimId: 'CLM-2024-8650',
      userName: 'Priya Singh',
      amount: 2100.0,
      status: 'pending',
      method: 'NEFT',
      initiatedDate: 'Dec 9, 2024',
      completedDate: null,
    },
    {
      id: 'PAY-2024-1541',
      claimId: 'CLM-2024-8543',
      userName: 'Amit Verma',
      amount: 8400.0,
      status: 'completed',
      method: 'IMPS',
      initiatedDate: 'Dec 1, 2024',
      completedDate: 'Dec 3, 2024',
    },
    {
      id: 'PAY-2024-1540',
      claimId: 'CLM-2024-8421',
      userName: 'Sneha Gupta',
      amount: 3200.0,
      status: 'completed',
      method: 'UPI Transfer',
      initiatedDate: 'Nov 22, 2024',
      completedDate: 'Nov 24, 2024',
    },
    {
      id: 'PAY-2024-1539',
      claimId: 'CLM-2024-8354',
      userName: 'Vikram Malhotra',
      amount: 1850.0,
      status: 'completed',
      method: 'Direct Deposit',
      initiatedDate: 'Nov 15, 2024',
      completedDate: 'Nov 17, 2024',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'processing':
        return 'bg-primary/20 text-primary';
      case 'pending':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-success" />;
      case 'processing':
        return <TrendingUp size={18} className="text-primary" />;
      case 'pending':
        return <Clock size={18} className="text-warning" />;
      default:
        return <Clock size={18} className="text-muted-foreground" />;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status !== 'completed').reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter((p) => p.status === 'completed').length;
  const pendingCount = payments.filter((p) => p.status !== 'completed').length;

  const stats = [
    {
      label: 'Total Paid',
      // 👇 CHANGED: Explicit 'en-IN' formatting
      value: `₹${totalPaid.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Pending Payments',
      value: `₹${totalPending.toLocaleString('en-IN')}`,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'In Progress',
      value: pendingCount,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground mb-2">Payments & Settlement</h1>
          <p className="text-muted-foreground">Track and manage claim payments</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <h3 className="text-foreground text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by payment ID, claim ID, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Payment ID</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Claim ID</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">User</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Amount</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Method</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Status</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Initiated</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Completed</th>
                <th className="px-6 py-4 text-left text-foreground text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-primary" />
                      <span className="text-foreground font-mono text-sm">{payment.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:underline font-mono text-sm">{payment.claimId}</button>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{payment.userName}</td>
                  <td className="px-6 py-4">
                    {/* 👇 CHANGED: Explicit 'en-IN' formatting */}
                    <span className="text-foreground font-semibold">₹{payment.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{payment.method}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{payment.initiatedDate}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {payment.completedDate || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
                      View
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={16} className="text-primary" />
                    <span className="text-foreground font-mono text-sm font-medium">{payment.id}</span>
                  </div>
                  <button className="text-xs text-primary hover:underline font-mono">{payment.claimId}</button>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">User</p>
                  <p className="text-foreground font-medium">{payment.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Amount</p>
                  <p className="text-foreground font-bold">₹{payment.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Method</p>
                  <p className="text-foreground">{payment.method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Initiated</p>
                  <p className="text-foreground">{payment.initiatedDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No Payments Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}