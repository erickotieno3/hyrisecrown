/**
 * Google OAuth Login Component
 * Displays the Google Sign-In button
 */

import React, { useEffect } from 'react';
import GoogleOAuthService, { GoogleUser } from '../services/googleOAuth';
import { useAuth } from '../contexts/AuthContext';

interface LoginComponentProps {
  onLoginSuccess?: (user: GoogleUser) => void;
  onLoginError?: (error: string) => void;
  buttonContainerId?: string;
  className?: string;
}

const GoogleOAuthLogin: React.FC<LoginComponentProps> = ({
  onLoginSuccess,
  onLoginError,
  buttonContainerId = 'google-signin-button',
  className = 'oauth-login-container',
}) => {
  const { user, initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize the Google Sign-In button
    const initButton = async () => {
      // Wait for DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const googleOAuth = GoogleOAuthService.getInstance();
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        const error = 'Google Client ID not configured';
        console.error(error);
        onLoginError?.(error);
        return;
      }

      try {
        googleOAuth.initOAuth({
          clientId,
          redirectUri: `${window.location.origin}/auth/callback`,
          scopes: ['profile', 'email'],
        });

        // Initialize the sign-in button
        googleOAuth.initializeSignInButton(buttonContainerId, (authenticatedUser) => {
          initializeAuth(clientId);
          onLoginSuccess?.(authenticatedUser);
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
        console.error('OAuth initialization error:', errorMsg);
        onLoginError?.(errorMsg);
      }
    };

    if (!user) {
      initButton();
    }
  }, [user, buttonContainerId, onLoginSuccess, onLoginError, initializeAuth]);

  if (user) {
    return (
      <div className={className}>
        <p>Welcome, {user.name}!</p>
        <img src={user.picture} alt={user.name} style={{ borderRadius: '50%', width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className={className}>
      <h2>Sign in with Google</h2>
      <div id={buttonContainerId}></div>
      <p className="oauth-notice">
        By signing in, you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default GoogleOAuthLogin;
