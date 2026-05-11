/**
 * App Layout with Splash Screen
 * 
 * Main application wrapper that shows splash screen on startup
 */

import React, { useEffect, useState } from 'react';
import { SplashScreen, useSplashScreen } from '@/components/SplashScreen';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export function AppLayout() {
  const { isVisible, progress, status, handleSplashComplete } = useSplashScreen();
  const [initialized, setInitialized] = useState(false);

  // Initialize app data
  const { isLoading } = useQuery({
    queryKey: ['app-init'],
    queryFn: async () => {
      // Simulate initialization steps
      const steps = [
        { delay: 100, action: 'Load user preferences' },
        { delay: 500, action: 'Fetch price data' },
        { delay: 1000, action: 'Initialize sync' },
        { delay: 1500, action: 'Load revisions' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      return { success: true };
    },
    onSuccess: () => {
      setInitialized(true);
      // Wait a bit for splash screen animation
      setTimeout(handleSplashComplete, 500);
    }
  });

  return (
    <div>
      <SplashScreen
        isVisible={isVisible && !initialized}
        loadingProgress={progress}
        statusMessage={status}
        onComplete={handleSplashComplete}
      />
      
      {/* Main App Content */}
      {initialized && (
        <div className="min-h-screen">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default AppLayout;
