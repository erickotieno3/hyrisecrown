/**
 * Splash Screen Component with Loading States
 * 
 * Displays on app startup with:
 * - App logo and branding
 * - Loading progress
 * - Status messages
 * - Animation effects
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  isVisible: boolean;
  loadingProgress?: number;
  statusMessage?: string;
  onComplete?: () => void;
  appName?: string;
  appVersion?: string;
}

export function SplashScreen({
  isVisible,
  loadingProgress = 0,
  statusMessage = 'Loading...',
  onComplete,
  appName = 'Global Price Tracker',
  appVersion = '1.0.0'
}: SplashScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(loadingProgress);
    }, 50);
    return () => clearTimeout(timer);
  }, [loadingProgress]);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex flex-col items-center justify-center z-50 overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: 300 + i * 100,
                  height: 300 + i * 100,
                  top: -100 - i * 50,
                  right: -100 - i * 50
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo/Icon */}
            <motion.div
              className="mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <svg
                  className="w-14 h-14 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {appName}
            </motion.h1>

            {/* Version */}
            <motion.p
              className="text-blue-100 text-sm mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              v{appVersion}
            </motion.p>

            {/* Status Message */}
            <motion.div
              className="mb-8 h-6"
              key={statusMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-blue-100 text-sm font-medium">{statusMessage}</p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="w-64 h-1 bg-blue-400/30 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Progress Text */}
            <motion.p
              className="text-blue-100 text-xs mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(displayProgress)}%
            </motion.p>

            {/* Loading Dots */}
            <motion.div
              className="flex justify-center gap-1.5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom Info */}
          <motion.div
            className="absolute bottom-8 text-center text-blue-100 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Real-time Price Tracking</p>
            <p className="text-blue-200 mt-1">Syncing data across your devices...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage splash screen state
 */
export function useSplashScreen(initialDelay: number = 2000) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const stages = [
      { progress: 10, status: 'Loading configuration...', delay: 500 },
      { progress: 30, status: 'Connecting to server...', delay: 1000 },
      { progress: 60, status: 'Syncing prices...', delay: 1500 },
      { progress: 90, status: 'Preparing interface...', delay: 2000 },
      { progress: 100, status: 'Ready!', delay: 2500 }
    ];

    const timers = stages.map(stage =>
      setTimeout(() => {
        setProgress(stage.progress);
        setStatus(stage.status);
      }, stage.delay)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleSplashComplete = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    progress,
    status,
    handleSplashComplete
  };
}

export default SplashScreen;
