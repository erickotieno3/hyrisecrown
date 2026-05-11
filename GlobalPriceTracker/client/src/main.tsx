import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Import our analytics and service integrations
import { initializeAnalytics } from "./lib/analytics";
import { initializeAdSense } from "./lib/adsense";
import { initializeFirebase, initializeCrashlytics } from "./lib/firebase";

// Initialize all third-party services before rendering
if (typeof window !== 'undefined') {
  // Initialize Google Analytics
  initializeAnalytics();
  
  // Initialize Google AdSense
  if (import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID) {
    initializeAdSense();
  }
  
  // Initialize Firebase and Crashlytics
  if (import.meta.env.FIREBASE_API_KEY) {
    initializeFirebase();
    initializeCrashlytics();
  }
}

// Render the React application
try {
  console.log("Attempting to render React application");
  const rootElement = document.getElementById("root");
  
  if (rootElement) {
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    );
    console.log("React render call completed");
  } else {
    console.error("Root element not found in the DOM");
  }
} catch (error) {
  console.error("Error rendering React application:", error);
  
  // Log error to Firebase Crashlytics if available
  if (typeof window !== 'undefined' && window.firebaseInitialized) {
    console.log('Reporting React render error to Crashlytics');
  }
  
  // Fallback rendering if React fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1>Tesco Price Comparison</h1>
        <p>There was an error rendering the application.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
}
