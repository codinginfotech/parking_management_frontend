import type { ExpoConfig } from 'expo/config';

/**
 * The Google Sign-In config plugin is only applied when GOOGLE_IOS_URL_SCHEME
 * is present, so the project runs out of the box before OAuth is configured.
 * Set it (reversed iOS client ID, `com.googleusercontent.apps.xxxx`) before
 * building a dev client with Google auth enabled.
 */
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;

const config: ExpoConfig = {
  name: 'Parkline',
  slug: 'parkline',
  version: '1.0.0',
  scheme: 'parkline',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  backgroundColor: '#0B0C0F',
  ios: {
    bundleIdentifier: 'com.parkline.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.parkline.app',
    edgeToEdgeEnabled: true,
  },
  splash: {
    backgroundColor: '#0B0C0F',
    resizeMode: 'contain',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    ...(googleIosUrlScheme
      ? [
          [
            '@react-native-google-signin/google-signin',
            { iosUrlScheme: googleIosUrlScheme },
          ] as [string, { iosUrlScheme: string }],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: false,
  },
};

export default config;
