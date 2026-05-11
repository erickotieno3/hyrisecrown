# Mobile App Wrapper Setup

This guide shows how to create native mobile app wrappers for the Tesco Price Comparison web application.

## Overview

The mobile apps will be created using:
- **Android**: Android Studio with WebView
- **iOS**: Xcode with WKWebView

These wrappers will load the web application but provide native features like:
- Push notifications
- Deep linking
- Native camera access (for barcode scanning)
- Offline mode
- App store distribution

## Android Setup Instructions

### 1. Create a new Android project

1. Open Android Studio
2. Create a new project with an "Empty Activity"
3. Choose a minimum SDK level of API 26 (Android 8.0)

### 2. Configure the WebView

Replace the content of `activity_main.xml` with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleLarge"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true" />

</RelativeLayout>
```

### 3. Configure the MainActivity

Update the `MainActivity.java` file:

```java
package com.hyrisecrown.tescopricecomparison;

import androidx.appcompat.app.AppCompatActivity;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private ProgressBar progressBar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        progressBar = findViewById(R.id.progressBar);
        webView = findViewById(R.id.webview);
        
        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setGeolocationEnabled(true);
        
        // Configure WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }
        });
        
        // Configure WebChromeClient
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load the web app URL
        webView.loadUrl("https://hyrisecrown.com");
    }
    
    // Handle back button press
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

### 4. Configure app permissions

Update the `AndroidManifest.xml` file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hyrisecrown.tescopricecomparison">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TescoPriceComparison">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

## iOS Setup Instructions

### 1. Create a new iOS project

1. Open Xcode
2. Create a new Single View App
3. Choose your project settings (Swift language, iOS 14.0 minimum)

### 2. Configure the ViewController

Update the `ViewController.swift` file:

```swift
import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    
    var webView: WKWebView!
    var progressView: UIProgressView!
    var activityIndicator: UIActivityIndicatorView!
    
    override func loadView() {
        // Create the web view configuration
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        
        // Create and configure the web view
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set up activity indicator
        activityIndicator = UIActivityIndicatorView()
        activityIndicator.center = self.view.center
        activityIndicator.hidesWhenStopped = true
        activityIndicator.style = .large
        view.addSubview(activityIndicator)
        
        // Set up progress view
        progressView = UIProgressView(progressViewStyle: .default)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(progressView)
        
        NSLayoutConstraint.activate([
            progressView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progressView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progressView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
        
        // Observe page loading progress
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)
        
        // Load web app
        let url = URL(string: "https://hyrisecrown.com")!
        webView.load(URLRequest(url: url))
        
        // Start activity indicator
        activityIndicator.startAnimating()
    }
    
    // Handle progress updates
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == "estimatedProgress" {
            progressView.progress = Float(webView.estimatedProgress)
        }
    }
    
    // Web view navigation delegate methods
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
        progressView.isHidden = true
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
    }
    
    // Clean up observers
    deinit {
        webView.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
    }
}
```

### 3. Configure Info.plist

Add the following keys to the `Info.plist` file:

```xml
<key>NSCameraUsageDescription</key>
<string>Tesco Price Comparison needs camera access to scan barcodes for price comparison.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Your location is used to show nearby stores with the best prices.</string>
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Additional Features

### AdMob Integration

#### Android
Add to `build.gradle`:
```gradle
implementation 'com.google.android.gms:play-services-ads:22.0.0'
```

Initialize in `MainActivity.java`:
```java
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;

// In onCreate method:
MobileAds.initialize(this, new OnInitializationCompleteListener() {
    @Override
    public void onInitializationComplete(InitializationStatus initializationStatus) {
    }
});
```

#### iOS
Add to `Podfile`:
```ruby
pod 'Google-Mobile-Ads-SDK'
```

Initialize in `AppDelegate.swift`:
```swift
import GoogleMobileAds

// In application(_:didFinishLaunchingWithOptions:) method:
GADMobileAds.sharedInstance().start(completionHandler: nil)
```

### Push Notifications

Follow the Firebase Cloud Messaging (FCM) setup guide to enable push notifications for both platforms.