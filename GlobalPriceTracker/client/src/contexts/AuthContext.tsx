/**
 * React Context for Google OAuth authentication
 * Provides auth state and methods to all components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import GoogleOAuthService, { GoogleUser } from '../services/googleOAuth';

interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  initializeAuth: (clientId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; clientId: string }> = ({
  children,
  clientId,
}) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth(clientId);
  }, [clientId]);

  const initializeAuth = (id: string) => {
    try {
      const googleOAuth = GoogleOAuthService.getInstance();
      
      // Get redirect URI
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      // Initialize OAuth service
      googleOAuth.initOAuth({
        clientId: id,
        redirectUri,
        scopes: ['profile', 'email'],
      });

      // Load current user if authenticated
      const currentUser = googleOAuth.getCurrentUser();
      setUser(currentUser);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      setIsLoading(false);
    }
  };

  const login = () => {
    // This is handled by the Google Sign-In button
    // The callback will update the user state
  };

  const logout = () => {
    try {
      const googleOAuth = GoogleOAuthService.getInstance();
      googleOAuth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
