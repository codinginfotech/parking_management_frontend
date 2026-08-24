import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { preferences } from '@/services/storage';
import { Palette, darkPalette, lightPalette } from './colors';

export { spacing, radius, MIN_TOUCH } from './spacing';
export { typography } from './typography';
export type { TypographyVariant } from './typography';
export type { Palette } from './colors';

export type ThemePreference = 'dark' | 'light' | 'system';

export interface Theme {
  colors: Palette;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<Theme>({
  colors: darkPalette,
  isDark: true,
  preference: 'dark',
  setPreference: () => {},
});

/**
 * Dark is the flagship experience and the default — many Android devices
 * (and emulators) can't express a system-level dark preference, so the app
 * owns the choice and persists it.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');

  useEffect(() => {
    void preferences.getThemePreference().then((stored) => {
      if (stored) setPreferenceState(stored);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void preferences.setThemePreference(next);
  }, []);

  const isDark =
    preference === 'system' ? systemScheme !== 'light' : preference === 'dark';

  const value = useMemo<Theme>(
    () => ({
      colors: isDark ? darkPalette : lightPalette,
      isDark,
      preference,
      setPreference,
    }),
    [isDark, preference, setPreference]
  );
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
