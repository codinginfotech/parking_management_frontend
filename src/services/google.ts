/**
 * Google Sign-In wrapper. The native module is unavailable in Expo Go, so it
 * is loaded defensively — the auth screens show the Google button only when
 * `isGoogleSignInAvailable()` returns true (i.e. in a dev/production build).
 */

interface GoogleSigninModule {
  configure(options: { webClientId?: string; iosClientId?: string }): void;
  hasPlayServices(options?: { showPlayServicesUpdateDialog?: boolean }): Promise<boolean>;
  signIn(): Promise<unknown>;
  signOut(): Promise<null>;
}

let googleSignin: GoogleSigninModule | null = null;
let configured = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-google-signin/google-signin') as {
    GoogleSignin: GoogleSigninModule;
  };
  googleSignin = mod.GoogleSignin;
} catch {
  googleSignin = null;
}

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function isGoogleSignInAvailable(): boolean {
  return Boolean(googleSignin && webClientId);
}

function ensureConfigured(): GoogleSigninModule {
  if (!googleSignin || !webClientId) {
    throw new Error('Google Sign-In is not available in this build');
  }
  if (!configured) {
    googleSignin.configure({
      webClientId,
      ...(iosClientId ? { iosClientId } : {}),
    });
    configured = true;
  }
  return googleSignin;
}

function extractIdToken(result: unknown): string | null {
  if (typeof result !== 'object' || result === null) return null;
  const record = result as Record<string, unknown>;
  // v13+ returns { type: 'success', data: { idToken } }; older versions return
  // { idToken } directly — support both.
  if (record.type === 'cancelled') return null;
  const data = (record.data ?? record) as Record<string, unknown>;
  return typeof data.idToken === 'string' ? data.idToken : null;
}

/** Returns the Google ID token, or null when the user dismissed the sheet. */
export async function signInWithGoogle(): Promise<string | null> {
  const google = ensureConfigured();
  await google.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await google.signIn();
  return extractIdToken(result);
}

export async function signOutOfGoogle(): Promise<void> {
  if (!googleSignin || !configured) return;
  try {
    await googleSignin.signOut();
  } catch {
    // Google session cleanup is best-effort; the backend session is already gone.
  }
}
