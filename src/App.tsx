import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { LandingPage } from './components/LandingPage';
import { AdminApp } from './components/AdminApp';
import { UserApp } from './components/UserApp';
import { User, LayoutDashboard, ArrowLeft, ShieldCheck } from 'lucide-react';

// Define the valid views for the application
type View = 'landing' | 'user' | 'admin' | 'auth';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  // --- 1. The Role Selection Component (Internal for simplicity) ---
  const AuthSelection = () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Select your portal to continue</p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* User Card */}
          <button 
            onClick={() => setCurrentView('user')}
            className="group relative flex flex-col items-center p-8 bg-card hover:bg-muted/50 border border-border rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 text-left"
          >
            <div className="h-14 w-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Policyholder</h3>
            <p className="text-sm text-muted-foreground text-center">
              File new claims, track status, and manage your insurance policies.
            </p>
          </button>

          {/* Admin Card */}
          <button 
            onClick={() => setCurrentView('admin')}
            className="group relative flex flex-col items-center p-8 bg-card hover:bg-muted/50 border border-border rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 text-left"
          >
            <div className="h-14 w-14 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Claims Adjuster</h3>
            <p className="text-sm text-muted-foreground text-center">
              Review incoming claims, verify documents, and approve payouts.
            </p>
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center pt-8">
          <button 
            onClick={() => setCurrentView('landing')}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans">
      <Toaster richColors position="top-right" />
      
      {currentView === 'landing' && (
        <LandingPage onSignIn={() => setCurrentView('auth')} />
      )}
      
      {currentView === 'auth' && <AuthSelection />}
      
      {/* 👇 UPDATED: Passing the onLogout prop here */}
      {currentView === 'user' && (
        <UserApp onLogout={() => setCurrentView('landing')} />
      )}
      
      {/* 👇 UPDATED: Passing the onLogout prop here */}
      {currentView === 'admin' && (
        <AdminApp onLogout={() => setCurrentView('landing')} />
      )}
    </div>
  );
}