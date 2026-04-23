import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  isLoading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token expiry check interval (5 minutes)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;
// Token refresh threshold (10 minutes before expiry)
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parse JWT token to get expiry
  const parseTokenExpiry = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }, []);

  // Check if token is expired or about to expire
  const isTokenValid = useCallback((token: string): { valid: boolean; needsRefresh: boolean } => {
    const expiry = parseTokenExpiry(token);
    if (!expiry) return { valid: false, needsRefresh: false };

    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    return {
      valid: timeUntilExpiry > 0,
      needsRefresh: timeUntilExpiry > 0 && timeUntilExpiry < TOKEN_REFRESH_THRESHOLD
    };
  }, [parseTokenExpiry]);

  // Validate token with server
  const validateToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    const { valid } = isTokenValid(token);
    if (!valid) {
      logout();
      return false;
    }

    try {
      const response = await fetch('/auth/validate-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't logout on network errors - token might still be valid
      return true;
    }
  }, [isTokenValid]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      const response = await fetch('/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwt_token', data.token);
        return true;
      } else {
        console.warn('Token refresh failed, logging out');
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  // Auto-login on mount with token validation
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('user_data');

      if (token && storedUser) {
        const { valid, needsRefresh } = isTokenValid(token);

        if (valid) {
          if (needsRefresh) {
            console.log('Token needs refresh, attempting refresh...');
            const refreshed = await refreshToken();
            if (!refreshed) {
              setIsLoggedIn(false);
              setUser(null);
              setIsLoading(false);
              return;
            }
          }

          // Validate with server
          const isValid = await validateToken();
          if (isValid) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
          } else {
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          // Token expired
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [isTokenValid, validateToken, refreshToken]);

  // Set up periodic token validation
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        logout();
        return;
      }

      const { valid, needsRefresh } = isTokenValid(token);

      if (!valid) {
        logout();
        return;
      }

      if (needsRefresh) {
        console.log('Periodic token refresh check');
        await refreshToken();
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isLoggedIn, isTokenValid, refreshToken]);

  const login = (token: string, userData: any) => {
    // Get existing user data from localStorage to preserve profile fields
    const existingUserDataStr = localStorage.getItem('user_data');
    let existingUserData = null;
    if (existingUserDataStr) {
      try {
        existingUserData = JSON.parse(existingUserDataStr);
      } catch (e) {
        console.error('Failed to parse existing user data:', e);
      }
    }

    // Only merge if it's the same user (same ID or email)
    let mergedUserData = userData;
    if (existingUserData && (
      existingUserData.id === userData.id ||
      existingUserData.email === userData.email
    )) {
      // Merge new login data with existing profile data
      // Preserve profile fields (phone, dob, address) if they exist in existing data
      mergedUserData = {
        ...userData, // New data from login (id, name, email)
        phone: existingUserData.phone || userData.phone,
        dob: existingUserData.dob || userData.dob,
        address: existingUserData.address || userData.address,
        // Preserve any other fields that might exist in existing data but not in new login data
        ...(Object.keys(existingUserData).reduce((acc: Record<string, any>, key) => {
          if (!['id', 'name', 'email', 'phone', 'dob', 'address'].includes(key) &&
            (existingUserData as any)[key] !== undefined) {
            acc[key] = (existingUserData as any)[key];
          }
          return acc;
        }, {} as Record<string, any>))
      };
    }

    // Store token with timestamp
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_data', JSON.stringify(mergedUserData));
    localStorage.setItem('login_time', Date.now().toString());

    setIsLoggedIn(true);
    setUser(mergedUserData);
  };

  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('login_time');

    // Clear any session-specific data
    sessionStorage.clear();

    setIsLoggedIn(false);
    setUser(null);

    // Redirect to login page
    window.location.href = '/';
  };

  const contextValue: AuthContextType = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    validateToken,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
