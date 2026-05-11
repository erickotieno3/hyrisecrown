# Google OAuth 2.0 Implementation Guide

## Overview

Global Price Comparison now includes Google OAuth 2.0 authentication for secure user login. This guide documents the implementation and setup requirements.

## Features

✅ **Google Sign-In** - Users can log in with their Google account  
✅ **Automatic Profile Loading** - User name and profile picture loaded from Google  
✅ **Token Management** - Secure token storage and validation  
✅ **Privacy Compliant** - OAuth privacy sections added to all legal documents  
✅ **Mobile & Web** - Works across Android, iOS, and web platforms  

## Configuration

### Web Frontend (React)

The OAuth implementation is in the `client/src` directory:

- **Services**: `services/googleOAuth.ts` - OAuth service
- **Context**: `contexts/AuthContext.tsx` - Auth state management
- **Components**: 
  - `components/GoogleOAuthLogin.tsx` - Login button component
  - `components/ProtectedRoute.tsx` - Protected route wrapper
- **Pages**:
  - `pages/login.tsx` - Login page
  - `pages/auth/callback.tsx` - OAuth callback handler

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_GOOGLE_CLIENT_ID=319956223388-2cu53nbqjqumsukct0vnnnqotgg10cas.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Global Price Comparison
```

Or copy from the example:
```bash
cp client/.env.example client/.env
```

### Google Cloud Setup

1. **Create OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project: `global-price-comparison`
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add origins:
     - `http://localhost:3000` (development)
     - `https://global-price-comparison.web.app` (production)
   - Add redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://global-price-comparison.web.app/auth/callback` (production)

2. **Configure Client ID**:
   - Copy your Client ID: `319956223388-2cu53nbqjqumsukct0vnnnqotgg10cas.apps.googleusercontent.com`
   - Add to environment variables

## Usage

### Login Implementation

```tsx
import { AuthProvider } from '@/contexts/AuthContext';
import GoogleOAuthLogin from '@/components/GoogleOAuthLogin';

// Wrap app with provider
<AuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</AuthProvider>

// Use in components
const handleLoginSuccess = (user: GoogleUser) => {
  console.log('User logged in:', user.name);
  // Redirect or update state
};

<GoogleOAuthLogin 
  onLoginSuccess={handleLoginSuccess}
  onLoginError={(error) => console.error(error)}
/>
```

### Accessing Auth State

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Switch>
  <Route path="/login" component={LoginPage} />
  <Route path="/dashboard">
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  </Route>
</Switch>
```

## API Integration

To validate tokens on the backend, implement token verification:

```typescript
// Backend example (Node.js)
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client('319956223388-2cu53nbqjqumsukct0vnnnqotgg10cas.apps.googleusercontent.com');

async function verifyToken(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '319956223388-2cu53nbqjqumsukct0vnnnqotgg10cas.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Android Integration

The Android app is configured for Google Sign-In:

1. **Package Name**: `com.globalprice.comparison`
2. **Deep Linking**: Configured for OAuth callbacks
3. **Intent Filters**: Set up for authentication flow

### Build for Android

```bash
cd android-app
npm install
eas build --platform android --profile production
```

## Legal & Privacy

All legal documents have been updated to include:

- Google OAuth 2.0 authentication policy
- User data handling with Google
- OAuth token management
- GDPR compliance

**Files updated**:
- `legal/PRIVACY_POLICY.md`
- `legal/TERMS_OF_SERVICE.md`
- `legal/COPYRIGHT_NOTICE.md`
- `legal/DMCA_POLICY.md`
- `legal/LICENSE.md`

## Security Best Practices

1. **Never store passwords** - Only tokens are stored
2. **Token validation** - Always validate tokens on the backend
3. **HTTPS only** - Use HTTPS for all OAuth requests
4. **Environment variables** - Secure sensitive credentials
5. **Token expiration** - Implement token refresh logic
6. **Logout cleanup** - Clear tokens on logout

## Troubleshooting

### Google Sign-In button not showing
- Verify Client ID is correct in environment variables
- Check Google SDK is loaded (watch browser console)
- Ensure domain is whitelisted in Google Cloud Console

### Token validation fails
- Verify token is not expired
- Check JWT payload for correct `aud` claim
- Ensure backend has correct Client ID configuration

### Redirect URI mismatch
- Ensure redirect URI matches exactly in Google Cloud Console
- Check for trailing slashes
- Verify HTTPS in production

## Support

For issues or questions:
- Email: erickotienokjv@gmail.com
- Phone: +254 0748-548285

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
