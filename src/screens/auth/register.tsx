import { router } from '@/navigation/nav';
import { ArrowLeft } from 'lucide-react-native';
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
import { useGoogleAuth, useRegister } from '@/features/auth/hooks';
import { apiErrorMessage, apiFieldErrors } from '@/services/api';
import { spacing, useTheme } from '@/theme';

interface FormState {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const register = useRegister();
  const google = useGoogleAuth();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const update = (key: keyof FormState) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next: Partial<FormState> = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name';
    if (form.businessName.trim().length < 2) next.businessName = 'Enter your business name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      next.phone = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 8) next.password = 'At least 8 characters';
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
      next.password = 'Use letters and numbers';
    if (form.confirmPassword !== form.password)
      next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    register.mutate(
      {
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      },
      {
        onError: (error) => {
          setErrors(apiFieldErrors(error) as Partial<FormState>);
          toast.show('error', 'Sign up failed', apiErrorMessage(error));
        },
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
    <Screen keyboardAvoiding>
      <BrandGlow />
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        style={{ marginTop: spacing.md, width: 40 }}
      >
        <ArrowLeft size={22} color={colors.textMuted} />
      </Pressable>

      <Animated.View entering={FadeInDown.duration(400)}>
        <AppText variant="display" style={{ marginTop: spacing.lg }}>
          Set up your{'\n'}parking business.
        </AppText>
      </Animated.View>

      <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
        <TextField
          label="Full name"
          value={form.fullName}
          onChangeText={update('fullName')}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Ayaan Pathan"
        />
        <TextField
          label="Business name"
          value={form.businessName}
          onChangeText={update('businessName')}
          error={errors.businessName}
          placeholder="Central Parking Co"
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={update('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="you@business.in"
        />
        <TextField
          label="Mobile number"
          value={form.phone}
          onChangeText={update('phone')}
          error={errors.phone}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="98765 43210"
        />
        <TextField
          label="Password"
          value={form.password}
          onChangeText={update('password')}
          error={errors.password}
          secureTextEntry
          autoComplete="new-password"
          hint="At least 8 characters, with letters and numbers"
          placeholder="Create a password"
        />
        <TextField
          label="Confirm password"
          value={form.confirmPassword}
          onChangeText={update('confirmPassword')}
          error={errors.confirmPassword}
          secureTextEntry
          placeholder="Repeat the password"
        />
        <Button title="Create account" onPress={submit} loading={register.isPending} />

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
    </Screen>
  );
}
