import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'parkline.accessToken';
const REFRESH_TOKEN_KEY = 'parkline.refreshToken';
const ACTIVE_LOT_KEY = 'parkline.activeLotId';
const THEME_KEY = 'parkline.theme';

/** Auth tokens live in the device keychain/keystore — never AsyncStorage. */
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

/** Non-sensitive preferences only. */
export const preferences = {
  async getActiveLotId(): Promise<string | null> {
    return AsyncStorage.getItem(ACTIVE_LOT_KEY);
  },
  async setActiveLotId(lotId: string | null): Promise<void> {
    if (lotId) {
      await AsyncStorage.setItem(ACTIVE_LOT_KEY, lotId);
    } else {
      await AsyncStorage.removeItem(ACTIVE_LOT_KEY);
    }
  },
  async getThemePreference(): Promise<'dark' | 'light' | 'system' | null> {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'light' || stored === 'system'
      ? stored
      : null;
  },
  async setThemePreference(preference: 'dark' | 'light' | 'system'): Promise<void> {
    await AsyncStorage.setItem(THEME_KEY, preference);
  },
};
