# Google Play Submission – Step by Step

**App:** Hyrise Crown Price Compare  
**Package:** com.hyrisecrown.tescopricecomparison  
**Google Account:** erickotienokjv@gmail.com

---

## Prerequisites (install once on your computer)

```bash
# Install Node.js from nodejs.org first, then:
npm install -g eas-cli expo-cli
```

---

## Step 1 — Create Expo Account

1. Go to https://expo.dev/signup
2. Sign up (use any email — this is separate from Google)
3. Come back here and log in:

```bash
eas login
# Enter your Expo email and password
```

---

## Step 2 — Get Google Play Service Account Key

This is required for automated submission.

1. Go to https://play.google.com/console (sign in as erickotienokjv@gmail.com)
2. Go to **Setup → API access**
3. Click **"Link to a Google Cloud project"** → Create new project
4. Click **"Create new service account"**
5. Follow the instructions → Grant **"Release manager"** role
6. Download the JSON key file
7. **Rename it to:** `google-play-service-account.json`
8. **Place it in this folder** (android-app/)

---

## Step 3 — Configure EAS Project

```bash
cd android-app
npm install
eas init --id hyrise-crown-price-compare
```

---

## Step 4 — Build & Submit

```bash
# Build for production (creates .aab bundle)
eas build --platform android --profile production

# When build finishes, submit to Google Play:
eas submit --platform android --latest
```

Or run both in one command:
```bash
npm run build-and-submit
```

---

## Alternative: PWABuilder (No coding needed)

If the above feels complex, use PWABuilder instead:

1. Make sure the app is live at https://hyrisecrown.com
2. Go to https://pwabuilder.com
3. Enter: https://hyrisecrown.com
4. Click "Package for Stores" → Google Play
5. Download the .aab file
6. Upload it manually at https://play.google.com/console

---

## Store Listing Details (copy-paste ready)

**App name:** Hyrise Crown Price Compare  
**Short description:** Compare supermarket prices globally – save money shopping smarter  
**Category:** Shopping  
**Content rating:** Everyone  

**Full description:**
Stop overpaying for groceries. Hyrise Crown helps you compare prices across the world's biggest supermarkets — Tesco, Walmart, Carrefour, Aldi, and more — all in one place.

Features:
- Real-time price comparison across multiple stores
- Search by product name or voice search in 15 languages
- Track trending deals and price drops
- Multi-country support
- Offline access
- M-Pesa paybill integration (Kenya)
- Earn rewards for smart shopping milestones

**Privacy Policy:** https://hyrisecrown.com/privacy  
**Website:** https://hyrisecrown.com  
