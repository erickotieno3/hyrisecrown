# Tesco Price Comparison Mobile App

This directory contains the React Native implementation of the Tesco Price Comparison app for Android and iOS.

## Setup Instructions

1. Install React Native CLI:
   ```bash
   npm install -g react-native-cli
   ```

2. Create a new React Native project:
   ```bash
   npx react-native init TescoPriceComparison
   ```

3. Navigate to the project directory:
   ```bash
   cd TescoPriceComparison
   ```

4. Install required dependencies:
   ```bash
   npm install @react-navigation/native @react-navigation/stack react-native-gesture-handler
   npm install @tanstack/react-query axios i18next react-i18next
   npm install react-native-vector-icons
   npm install @react-native-async-storage/async-storage
   ```

5. For AdMob integration:
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/admob
   ```

## Project Structure

```
/TescoPriceComparison
  /android            # Android-specific files
  /ios                # iOS-specific files
  /src
    /api              # API services
    /assets           # Images, fonts, etc.
    /components       # Reusable UI components
    /contexts         # Context providers
    /hooks            # Custom hooks
    /navigation       # Navigation setup
    /screens          # App screens
    /services         # Business logic
    /theme            # UI theme configuration
    /translations     # i18n translations
    /utils            # Utility functions
  App.js              # Root component
  index.js            # Entry point
```

## Key Implementation Details

1. The mobile app will use the same backend API as the web app
2. Authentication will be implemented for premium features
3. Push notifications will be used for price alerts
4. Google Analytics will track user engagement and conversions
5. AdMob will be integrated for advertising revenue

## Build and Release Process

1. For Android:
   ```bash
   cd android && ./gradlew assembleRelease
   ```

2. The build will generate an APK file in:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

3. This APK can be uploaded to Google Play Store

## App Store Assets

Create the following graphics for store listings:

1. App icons (various sizes)
2. Feature graphic (1024×500)
3. App screenshots (minimum 2, recommended 8)
4. Promotional graphics

## Affiliate Marketing Implementation

1. Create an `AffiliateService` class to handle tracking links
2. Implement deep linking for app-to-store redirections
3. Add affiliate disclosure in app settings/about section