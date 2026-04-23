import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, User, Loader2 } from 'lucide-react';

interface UserLoginProps {
  onLogin: (token: string, user: any) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

export function UserLogin({ onLogin }: UserLoginProps) {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  const handleAction = async (url: string, payload: any, onSuccess: (data: any) => void) => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`http://localhost:3000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data);
        setError('');
      } else {
        let errorMessage = data.error || 'Request failed';

        if (data.code === 'ACCOUNT_LOCKED') {
          errorMessage = 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.';
        } else if (data.code === 'INVALID_CREDENTIALS') {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (data.code === 'RATE_LIMITED') {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (data.code === 'EMAIL_ALREADY_USED') {
          errorMessage = 'This email is already registered. Please log in or use a different email.';
        }

        // Use message from backend if available and more descriptive
        if (data.message && data.message.length > errorMessage.length) {
          errorMessage = data.message;
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'LOGIN') {
      if (!email.trim() || !password.trim()) return setError('Please fill in all required fields.');
      handleAction('/auth/login', { email, password }, (data) => {
        onLogin(data.token, data.user);
      });
    } else if (mode === 'SIGNUP') {
      if (!name.trim() || !email.trim() || !password.trim())
        return setError('Please provide name, email and password.');

      if (password.length < 6) {
        return setError('Password must be at least 6 characters long.');
      }

      handleAction('/auth/signup', { name, email, password }, (data) => {
        setSuccessMsg(data.message || 'Account created successfully! Please log in.');
        // After successful signup, switch to login mode
        setTimeout(() => {
          setMode('LOGIN');
          setSuccessMsg('Account created successfully! Please log in.');
        }, 1500);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-xl mb-4">
            <Shield className="text-primary" size={32} />
          </div>
          <h1 className="mb-2">SmartClaim Secure</h1>
          <p className="text-muted-foreground">Advanced security for your claims portal</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-card-elevated animate-in zoom-in-95 duration-300">
          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
            <div className="mb-6 flex space-x-4 border-b border-border pb-4">
              <button
                className={`flex-1 text-lg font-semibold ${mode === 'LOGIN' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => switchMode('LOGIN')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 text-lg font-semibold ${mode === 'SIGNUP' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => switchMode('SIGNUP')}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm flex gap-2"><AlertCircle size={18} /> {error}</div>}
          {successMsg && <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-500 text-sm flex gap-2"><Shield size={18} /> {successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'SIGNUP' && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-muted-foreground" size={20} />
                    <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full bg-input-background border border-input pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/50" disabled={isLoading} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full bg-input-background border border-input pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/50" required disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-1.5 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full bg-input-background border border-input pl-10 pr-10 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/50" required minLength={6} disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:bg-primary/90 mt-2 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {mode === 'LOGIN' && "Sign In Securely"}
              {mode === 'SIGNUP' && "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border flex justify-center text-sm text-muted-foreground gap-2">
            <Shield size={16} className="text-emerald-500" />
            Encrypted & Secured by JWT
          </div>
        </div>
      </div>
    </div>
  );
}