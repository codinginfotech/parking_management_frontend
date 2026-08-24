import {
  StackActions,
  createNavigationContainerRef,
  useRoute,
} from '@react-navigation/native';
import type { RootParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootParamList>();

/**
 * Maps the app's original route paths to React Navigation screen names, so
 * call sites keep the familiar `router.push('/(app)/entry')` shape after the
 * migration off expo-router.
 */
const PATH_TO_SCREEN: Record<string, keyof RootParamList> = {
  '/(auth)/login': 'Login',
  '/(auth)/register': 'Register',
  '/(app)/entry': 'Entry',
  '/(app)/exit': 'Exit',
  '/(app)/lots': 'Lots',
  '/(app)/lots/create': 'LotCreate',
  '/(app)/lots/[id]': 'LotDetail',
  '/(app)/staff': 'Staff',
  '/(app)/staff/create': 'StaffCreate',
  '/(app)/passes': 'Passes',
  '/(app)/passes/create': 'PassCreate',
  '/(app)/shift': 'Shift',
  '/(app)/reports': 'Reports',
  '/(app)/alerts': 'Alerts',
  '/(app)/profile': 'Profile',
};

type Href = string | { pathname: string; params?: Record<string, unknown> };

function resolve(href: Href): { screen: keyof RootParamList; params?: object } | null {
  const pathname = typeof href === 'string' ? href : href.pathname;
  const params = typeof href === 'string' ? undefined : href.params;
  const screen = PATH_TO_SCREEN[pathname];
  if (!screen) {
    if (__DEV__) console.warn(`[nav] Unknown route: ${pathname}`);
    return null;
  }
  return { screen, params };
}

/** Drop-in replacement for expo-router's global `router`. */
export const router = {
  push(href: Href): void {
    const target = resolve(href);
    if (target && navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(target.screen, target.params));
    }
  },
  replace(href: Href): void {
    const target = resolve(href);
    if (target && navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(target.screen, target.params));
    }
  },
  back(): void {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
};

/** Drop-in replacement for expo-router's `useLocalSearchParams`. */
export function useLocalSearchParams<T extends object>(): Partial<T> {
  const route = useRoute();
  return (route.params ?? {}) as Partial<T>;
}
