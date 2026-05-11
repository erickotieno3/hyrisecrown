/**
 * OAuth Callback Page
 * Handles the callback from Google OAuth
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const [, navigate] = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
    } else {
      // If not authenticated, redirect to login
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        textAlign: 'center',
      }}>
        <h2>Processing login...</h2>
        <p>Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
