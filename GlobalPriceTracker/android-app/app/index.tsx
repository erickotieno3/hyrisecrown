import { WebView } from 'react-native-webview';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#00539F" />
      <WebView
        source={{ uri: 'https://hyrisecrown.com' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        geolocationEnabled={true}
        allowFileAccess={true}
        mixedContentMode="always"
        userAgent="HyriseCrown/1.0 Android"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00539F',
  },
  webview: {
    flex: 1,
  },
});
