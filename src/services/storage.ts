import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'parkline.accessToken';
const REFRESH_TOKEN_KEY = 'parkline.refreshToken';
const ACTIVE_LOT_KEY = 'parkline.activeLotId';
const THEME_KEY = 'parkline.theme';

async function getSecureItem(key: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(key, value, { service: key });
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch {
    // Best-effort: a missing entry is fine.
  }
}

/** Auth tokens live in the device keychain/keystore — never AsyncStorage. */
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return getSecureItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return getSecureItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setSecureItem(ACCESS_TOKEN_KEY, accessToken),
      setSecureItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      deleteSecureItem(ACCESS_TOKEN_KEY),
      deleteSecureItem(REFRESH_TOKEN_KEY),
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
