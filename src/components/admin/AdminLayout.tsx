import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Shield,
  User,
  FileCheck
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'manage-all', name: 'All Claims & Apps', icon: Shield, badge: null },
    { id: 'claims', name: 'Claims Management', icon: FileText, badge: null },
    { id: 'applications', name: 'Applications Review', icon: FileCheck, badge: null },
    { id: 'fraud', name: 'Fraud Alerts', icon: AlertTriangle, badge: 5 },
    { id: 'users', name: 'User Management', icon: Users, badge: null },
    { id: 'payments', name: 'Payments', icon: DollarSign, badge: null },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'settings', name: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#030712] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#111827] border-r border-[#1f2937] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 border-b border-[#1f2937] flex items-center justify-between px-4 bg-gradient-to-r from-[#0B1220] to-[#111827]">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-1.5 rounded-lg">
                  <Shield className="text-white" size={20} />
                </div>
                <span className="font-semibold text-white">SmartClaim AI</span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#1f2937] rounded-lg transition-colors text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${currentPage === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-300 hover:bg-[#1f2937] hover:text-white'
                  }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentPage === item.id
                        ? 'bg-white text-blue-700'
                        : 'bg-red-500 text-white'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-[#1f2937] p-4">
            <div className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={20} />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">Admin User</p>
                  <p className="text-caption text-gray-400 truncate">admin@smartclaim.ai</p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button
                onClick={onLogout}
                className="w-full mt-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-3 py-2 rounded-lg transition-all border border-red-500/20"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#1f2937] rounded-lg transition-colors lg:hidden text-gray-300"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search claims, users, policies..."
                className="bg-[#1f2937] border border-[#374151] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-80 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-[#1f2937] rounded-lg transition-colors text-gray-300">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Profile (desktop only) */}
            <div className="hidden lg:flex items-center gap-3 ml-3 pl-3 border-l border-[#374151]">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-700 rounded-full flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-caption text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
