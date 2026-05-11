/**
 * Google OAuth 2.0 Authentication Service
 * Handles user authentication using Google's OAuth 2.0 protocol
 */

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  idToken: string;
}

export interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private config: GoogleAuthConfig | null = null;
  private user: GoogleUser | null = null;

  private constructor() {}

  static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Initialize Google OAuth with configuration
   */
  initOAuth(config: GoogleAuthConfig): void {
    this.config = config;
    
    // Load Google SDK if not already loaded
    if (!window.google) {
      this.loadGoogleSDK();
    }
  }

  /**
   * Load Google SDK dynamically
   */
  private loadGoogleSDK(): void {
    return new Promise((resolve) => {
      if (document.getElementById('google-oauth-sdk')) {
        resolve(undefined);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-oauth-sdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(undefined);
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Sign-In button
   */
  initializeSignInButton(elementId: string, callback: (user: GoogleUser) => void): void {
    if (!this.config) {
      throw new Error('Google OAuth not initialized. Call initOAuth first.');
    }

    if (!window.google?.accounts?.id) {
      console.error('Google SDK not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.config.clientId,
      callback: (response) => {
        if (response.credential) {
          this.handleTokenResponse(response.credential, callback);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById(elementId)!,
      {
        theme: 'outline',
        size: 'large',
        width: '350',
      }
    );
  }

  /**
   * Handle token response from Google
   */
  private handleTokenResponse(token: string, callback: (user: GoogleUser) => void): void {
    try {
      const decoded = this.decodeToken(token);
      
      this.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        accessToken: token,
        idToken: token,
      };

      // Store token in localStorage
      localStorage.setItem('googleOAuthToken', token);
      localStorage.setItem('googleUser', JSON.stringify(this.user));

      callback(this.user);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  /**
   * Decode JWT token (basic implementation)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): GoogleUser | null {
    if (this.user) {
      return this.user;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('googleUser');
    if (stored) {
      try {
        this.user = JSON.parse(stored);
        return this.user;
      } catch (error) {
        console.error('Error restoring user:', error);
      }
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('googleOAuthToken');
  }

  /**
   * Sign out user
   */
  signOut(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    this.user = null;
    localStorage.removeItem('googleOAuthToken');
    localStorage.removeItem('googleUser');
  }

  /**
   * Validate token and refresh if needed
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return false;
      }

      // Check if token is expired
      const expiresIn = decoded.exp * 1000 - Date.now();
      if (expiresIn < 0) {
        this.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}

// Extend window interface for Google SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
          onLoad: (callback: () => void) => void;
        };
      };
    };
  }
}

export default GoogleOAuthService;
