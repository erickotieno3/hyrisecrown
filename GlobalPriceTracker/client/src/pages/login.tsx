/**
 * Login Page using Google OAuth
 */

import React from 'react';
import { useNavigate } from 'wouter';
import GoogleOAuthLogin from '@/components/GoogleOAuthLogin';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleUser } from '@/services/googleOAuth';

const LoginPage: React.FC = () => {
  const [, navigate] = useNavigate();
  const { user } = useAuth();

  const handleLoginSuccess = (authenticatedUser: GoogleUser) => {
    console.log('Login successful:', authenticatedUser);
    // Redirect to home page or dashboard
    navigate('/');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    alert('Login failed: ' + error);
  };

  // If already logged in, redirect to home
  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Global Price Comparison
        </h1>
        
        <GoogleOAuthLogin
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
          className="oauth-login"
        />

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          <p>By logging in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
