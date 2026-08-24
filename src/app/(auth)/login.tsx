import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BrandGlow } from '@/components/shared/BrandGlow';
import { GoogleButton } from '@/components/shared/GoogleButton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { useGoogleAuth, useLogin } from '@/features/auth/hooks';
import { apiErrorMessage } from '@/services/api';
import { spacing, useTheme } from '@/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const login = useLogin();
  const google = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
    if (password.length === 0) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    login.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onError: (error) => toast.show('error', 'Sign in failed', apiErrorMessage(error)),
      }
    );
  };

  const handleGoogle = () => {
    if (!google.isAvailable) {
      toast.show(
        'info',
        'Google Sign-In unavailable',
        'Use a development build with Google OAuth configured.'
      );
      return;
    }
    google.mutate(undefined, {
      onError: (error) => toast.show('error', 'Google sign-in failed', apiErrorMessage(error)),
    });
  };

  return (
    <Screen keyboardAvoiding contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <BrandGlow />
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.accent,
            }}
          />
          <AppText variant="label" color="text" style={{ letterSpacing: 4 }}>
            Parkline
          </AppText>
        </View>
        <AppText variant="display" style={{ marginTop: spacing.lg }}>
          Welcome{'\n'}back.
        </AppText>
        <AppText variant="body" color="textMuted" style={{ marginTop: spacing.md }}>
          Sign in to run your parking operations.
        </AppText>
      </Animated.View>

      <View style={{ marginTop: spacing.xxxl, gap: spacing.lg }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="you@business.in"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoComplete="password"
          placeholder="Your password"
          right={
            <Pressable
              onPress={() => setShowPassword((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              hitSlop={8}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textFaint} />
              ) : (
                <Eye size={18} color={colors.textFaint} />
              )}
            </Pressable>
          }
        />
        <Button title="Sign in" onPress={submit} loading={login.isPending} />

        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginVertical: spacing.xs }}
        >
          <Divider style={{ flex: 1, width: undefined }} />
          <AppText variant="bodySmall" color="textFaint">
            or
          </AppText>
          <Divider style={{ flex: 1, width: undefined }} />
        </View>

        <GoogleButton onPress={handleGoogle} loading={google.isPending} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: spacing.xxl,
          gap: spacing.xs,
        }}
      >
        <AppText variant="body" color="textMuted">
          New to Parkline?
        </AppText>
        <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
          <AppText variant="bodyMedium" color="accent">
            Create your business
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
