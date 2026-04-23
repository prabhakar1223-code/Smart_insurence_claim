import React, { useState } from 'react';
import { Search, Filter, UserPlus, Edit, Trash2, Shield, CheckCircle, XCircle, MoreVertical, MapPin } from 'lucide-react';

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 👇 CHANGED: Indian Names, Numbers, and added Location
  const users = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210',
      location: 'Mumbai, MH',
      status: 'active',
      verified: true,
      claimsCount: 12,
      joinedDate: 'Jan 15, 2023',
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 91234 56789',
      location: 'Delhi, DL',
      status: 'active',
      verified: true,
      claimsCount: 8,
      joinedDate: 'Mar 22, 2023',
      lastActive: '1 day ago',
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+91 99887 76655',
      location: 'Ahmedabad, GJ',
      status: 'pending',
      verified: false,
      claimsCount: 2,
      joinedDate: 'Dec 1, 2024',
      lastActive: '3 days ago',
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      phone: '+91 88776 65544',
      location: 'Bangalore, KA',
      status: 'active',
      verified: true,
      claimsCount: 15,
      joinedDate: 'Feb 10, 2023',
      lastActive: '5 hours ago',
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 77665 54433',
      location: 'Jaipur, RJ',
      status: 'suspended',
      verified: true,
      claimsCount: 3,
      joinedDate: 'Aug 5, 2023',
      lastActive: '2 weeks ago',
    },
    {
      id: 6,
      name: 'Anjali Das',
      email: 'anjali.das@example.com',
      phone: '+91 98321 65498',
      location: 'Kolkata, WB',
      status: 'active',
      verified: true,
      claimsCount: 5,
      joinedDate: 'Sep 12, 2023',
      lastActive: '10 mins ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'suspended':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-primary' },
    { label: 'Active Users', value: users.filter((u) => u.status === 'active').length, color: 'text-success' },
    { label: 'Pending Verification', value: users.filter((u) => !u.verified).length, color: 'text-warning' },
    { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length, color: 'text-destructive' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage policy holders and their accounts</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity">
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">User Details</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">Contact Info</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">Status</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">KYC Verified</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">Claims</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">Last Active</th>
                <th className="px-6 py-4 text-left text-foreground font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={10} /> {user.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border border-transparent ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <div className="flex items-center gap-1.5 text-success">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-warning">
                        <XCircle size={16} />
                        <span className="text-sm font-medium">Pending</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-6 bg-muted rounded text-xs font-medium text-foreground">
                      {user.claimsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-primary/10 text-primary rounded-md transition-colors" title="Edit user">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors" title="Delete user">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.location}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Contact</p>
                  <p className="text-foreground text-xs truncate">{user.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">KYC</p>
                  {user.verified ? (
                    <span className="text-success text-xs flex items-center gap-1"><CheckCircle size={12}/> Verified</span>
                  ) : (
                    <span className="text-warning text-xs flex items-center gap-1"><XCircle size={12}/> Pending</span>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Claims</p>
                  <p className="text-foreground">{user.claimsCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No Users Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}