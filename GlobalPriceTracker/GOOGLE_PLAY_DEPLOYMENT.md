# Google Play Deployment Guide for GlobalPriceTracker

## Overview
This guide walks you through deploying your app to Google Play Store using:
- **Method 1**: Automated GitHub Actions (Recommended - automatic on every push)
- **Method 2**: Manual CLI deployment using EAS

---

## METHOD 1: Automated GitHub Actions Deployment (RECOMMENDED)

### Step 1: Get Your Google Play Service Account JSON

1. **Sign in to Google Play Console**
   - Go to https://play.google.com/console
   - Use: erickotienokjv@gmail.com

2. **Create a Service Account**
   - Click **Setup → API Access**
   - Click **"Link to a Google Cloud project"** (if not already linked)
   - Click **"Create new service account"**
   - Go to Google Cloud Console (the link provided)
   - Create service account with name: `google-play-deploy`
   - Grant it the **"Release manager"** role
   - Create and download a JSON key file

3. **Save the JSON Key to GitHub Secrets**
   - Go to your GitHub repository: https://github.com/erickotieno3/GlobalPriceTracker
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **"New repository secret"**
   - Name: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - Value: Paste the entire contents of the downloaded JSON file
   - Click **"Add secret"**

### Step 2: Let GitHub Actions Deploy Automatically

Once the secret is added, the GitHub Actions workflow will:
- **Trigger**: On every push to `main` branch (or manually via Actions tab)
- **Build**: Create a production Android App Bundle
- **Submit**: Automatically submit to Google Play Store

**That's it!** Your app will be submitted automatically.

For manual uploads, see **METHOD 2** below.

---

## METHOD 2: Manual Deployment Using CLI

### Prerequisites
```bash
# Install required tools globally
npm install -g eas-cli expo-cli
```

### Step 1: Authenticate with Expo

```bash
cd /workspaces/GlobalPriceTracker/android-app
eas login
# Enter your Expo account email and password
# (Create one at https://expo.dev/signup if you don't have one)
```

### Step 2: Create Service Account JSON

Same as Method 1, Step 1 above. Place the downloaded JSON file in:
```
/workspaces/GlobalPriceTracker/android-app/google-play-service-account.json
```

### Step 3: Install Dependencies

```bash
cd /workspaces/GlobalPriceTracker/android-app
npm install
```

### Step 4: Build & Submit

```bash
# Option A: Build only (creates APK/AAB for manual review)
eas build --platform android --profile production

# Option B: Build & automatically submit to Google Play
npm run build-and-submit
# OR
eas build --platform android --profile production && \
eas submit --platform android --latest
```

The build will take 10-15 minutes. You'll see a build URL where you can monitor progress.

Once complete, your app will be submitted to Google Play and appear in your console.

---

## App Listing Details (for Google Play Store)

When your app first appears in Google Play Console, fill in these details:

**Basic Info:**
- **App name:** Hyrise Crown Price Compare
- **Short description:** Compare supermarket prices globally – save money shopping smarter
- **Category:** Shopping
- **Content rating:** Everyone

**Full Description:**
```
Stop overpaying for groceries. Hyrise Crown helps you compare prices across the 
world's biggest supermarkets — Tesco, Walmart, Carrefour, Aldi, and more — 
all in one place.

Features:
- Real-time price comparison across multiple stores
- Search by product name or voice search in 15 languages
- Track trending deals and price drops
- Multi-country support
- Offline access
- M-Pesa paybill integration (Kenya)
- Earn rewards for smart shopping milestones

Save time & money by knowing where to shop before you leave home.
```

**Contact & Links:**
- **Website:** https://hyrisecrown.com
- **Email:** erickotienokjv@gmail.com
- **Privacy Policy:** https://hyrisecrown.com/privacy

**Screenshots & Graphics:**
- **Icon:** 512×512 PNG
- **Feature Graphic:** 1024×500 PNG
- **Screenshots:** Min 2 (different device sizes)

---

## Troubleshooting

### Build fails with "artifact not found"
→ The EAS build servers are still compiling. Wait 5-10 minutes and retry.

### Submit fails with "Invalid service account"
→ Check that the JSON file is in the correct location and contains valid keys.

### App is in "Draft" status
→ You need to complete the store listing details in Google Play Console before release.

### Want to test before release?
→ Use the Internal Testing track:
```bash
eas submit --platform android --latest --profile production-internal
```

---

## Next Steps

1. ✅ Add the service account JSON to GitHub Secrets (see Step 1 above)
2. ✅ Wait for the GitHub Actions workflow to complete (check Actions tab)
3. ✅ Go to Google Play Console to complete your store listing (graphics, screenshots, etc.)
4. ✅ Submit for review when ready

Questions? See the [android-app/SETUP_INSTRUCTIONS.md](android-app/SETUP_INSTRUCTIONS.md) for more details.
