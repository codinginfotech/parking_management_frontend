import { create } from 'zustand';
import { registerAuthHandlers, setAccessToken } from '@/services/api';
import { authService } from '@/services/auth.service';
import { signOutOfGoogle } from '@/services/google';
import { connectSocket, disconnectSocket, updateSocketToken } from '@/services/socket';
import { tokenStorage } from '@/services/storage';
import type { AuthResult, User } from '@/types/models';

type AuthStatus = 'booting' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  bootstrap: () => Promise<void>;
  completeSignIn: (result: AuthResult) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'booting',
  user: null,

  async bootstrap() {
    registerAuthHandlers({
      onSessionRenewed: (result) => {
        updateSocketToken(result.accessToken);
        set({ user: result.user });
      },
      onSessionExpired: () => {
        void get().signOut();
      },
    });

    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      set({ status: 'guest', user: null });
      return;
    }

    setAccessToken(accessToken);
    try {
      const user = await authService.me();
      set({ status: 'authenticated', user });
      connectSocket(accessToken);
    } catch {
      // The API interceptor will have attempted a refresh; if the session is
      // truly gone, fall back to guest without wiping tokens the interceptor
      // may have just rotated.
      const retryToken = await tokenStorage.getAccessToken();
      if (retryToken && retryToken !== accessToken) {
        try {
          const user = await authService.me();
          set({ status: 'authenticated', user });
          connectSocket(retryToken);
          return;
        } catch {
          // fall through to guest
        }
      }
      await tokenStorage.clear();
      setAccessToken(null);
      set({ status: 'guest', user: null });
    }
  },

  async completeSignIn(result) {
    await tokenStorage.setTokens(result.accessToken, result.refreshToken);
    setAccessToken(result.accessToken);
    connectSocket(result.accessToken);
    set({ status: 'authenticated', user: result.user });
  },

  async signOut() {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      await authService.logout(refreshToken);
    } catch {
      // Signing out locally must always succeed, even offline.
    }
    await signOutOfGoogle();
    await tokenStorage.clear();
    setAccessToken(null);
    disconnectSocket();
    set({ status: 'guest', user: null });
  },

  setUser(user) {
    set({ user });
  },
}));
