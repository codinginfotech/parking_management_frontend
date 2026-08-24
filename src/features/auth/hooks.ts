import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { RegisterPayload, authService } from '@/services/auth.service';
import { isGoogleSignInAvailable, signInWithGoogle } from '@/services/google';
import { useAuthStore } from '@/store/auth.store';
import type { AuthResult } from '@/types/models';

function useCompleteSignIn() {
  return useAuthStore((state) => state.completeSignIn);
}

export function useLogin() {
  const completeSignIn = useCompleteSignIn();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (result: AuthResult) => completeSignIn(result),
  });
}

export function useRegister() {
  const completeSignIn = useCompleteSignIn();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (result: AuthResult) => completeSignIn(result),
  });
}

/**
 * "Continue with Google": obtain the Google credential on-device, hand it to
 * the backend, which verifies it and either signs in or creates the account.
 */
export function useGoogleAuth() {
  const completeSignIn = useCompleteSignIn();
  const [cancelled, setCancelled] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      setCancelled(false);
      const idToken = await signInWithGoogle();
      if (!idToken) {
        setCancelled(true);
        return null;
      }
      return authService.google(idToken);
    },
    onSuccess: (result: AuthResult | null) => {
      if (result) return completeSignIn(result);
      return undefined;
    },
  });

  return { ...mutation, cancelled, isAvailable: isGoogleSignInAvailable() };
}
