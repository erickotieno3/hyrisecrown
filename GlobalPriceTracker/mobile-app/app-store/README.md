# App Store Publishing Guide

This document provides instructions on how to prepare and publish the Tesco Price Comparison app to both the Google Play Store and Apple App Store.

## Required Assets

### Google Play Store
1. **App Icon**: 512x512 pixel PNG with transparency
2. **Feature Graphic**: 1024x500 pixel JPG or PNG
3. **Screenshots**: At least 2 screenshots for each supported device type:
   - Phone: 16:9 aspect ratio (minimum 320px width)
   - Tablet: 16:9 aspect ratio (minimum 1080px width)
4. **Privacy Policy URL**: A live URL to your privacy policy page

### Apple App Store
1. **App Icon**: 1024x1024 pixel PNG without transparency
2. **Screenshots**:
   - iPhone: 6.5" Super Retina Display (1242 x 2688 pixels)
   - iPad: 12.9" iPad Pro (2048 x 2732 pixels)
3. **App Preview Videos**: 15-30 seconds (optional)
4. **Privacy Policy URL**: A live URL to your privacy policy page

## Generation Process

### App Icons
- Create app icons using Tesco's blue color scheme
- Include a simple, recognizable logo that works at small sizes
- For iOS, remove any transparency
- Templates are available in the `/icons-templates` directory

### Screenshots
- Generate screenshots from the live app on actual devices or emulators
- Include key app features:
  - Homepage with price comparison
  - Product detail screen with multiple price options
  - Country selection screen
  - Search results
  - Settings page with language selector

### Feature Graphic (Google Play)
- Create a feature graphic that highlights the core value of price comparison
- Use Tesco's blue color scheme
- Include devices showing the app in action
- Add a simple tagline: "Compare Prices Globally"

## App Signing

### Android
- Generate a keystore file using Android Studio or the command line:
  ```bash
  keytool -genkey -v -keystore tesco_comparison_key.keystore -alias tesco_comparison -keyalg RSA -keysize 2048 -validity 10000
  ```
- Keep this keystore file secure, as it will be needed for all future updates

### iOS
- Generate a distribution certificate from the Apple Developer portal
- Create an App Store provisioning profile
- Export a signed IPA file from Xcode

## Publishing Checklist

### Pre-submission Testing
- Test on multiple device sizes
- Check all app features
- Verify correct handling of offline mode
- Test push notifications
- Validate all external links
- Run accessibility checks

### Final Submission Steps

#### Google Play Console
1. Create a new application
2. Complete store listing information (found in google-play-listing.md)
3. Upload APK or App Bundle
4. Set up pricing and distribution
5. Complete content rating questionnaire
6. Set up app release (internal testing, closed testing, open testing, or production)

#### Apple App Store Connect
1. Create a new iOS app
2. Complete App Information (found in apple-app-store-listing.md)
3. Upload build through Xcode or Transporter
4. Complete App Review Information
5. Submit for review

## Post-Publication

- Monitor crash reports
- Respond to user reviews
- Plan regular updates with new features and improvements
- Keep app store screenshots and descriptions updated with new features