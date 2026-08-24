import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { ROLE_LABELS } from '@/constants';
import { useUpdateProfile } from '@/features/profile/hooks';
import { apiErrorMessage } from '@/services/api';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [businessName, setBusinessName] = useState(user?.business?.name ?? '');

  const updateBusiness = useMutation({
    mutationFn: () => authService.updateBusiness({ name: businessName.trim() }),
    onSuccess: (business) => {
      if (user) setUser({ ...user, business: { id: business.id, name: business.name } });
      toast.show('success', 'Business updated');
    },
    onError: (error) => toast.show('error', 'Update failed', apiErrorMessage(error)),
  });

  if (!user) return null;
  const isOwner = user.role === 'OWNER' || user.role === 'ADMIN';

  return (
    <Screen keyboardAvoiding>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">Profile</AppText>
      </View>

      <AppText variant="bodySmall" color="textMuted" style={{ marginTop: spacing.sm }}>
        {user.email} · {ROLE_LABELS[user.role] ?? user.role}
        {user.authProvider === 'GOOGLE' ? ' · Google account' : ''}
      </AppText>

      <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} />
        <TextField
          label="Mobile"
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Button
          title="Save profile"
          variant="secondary"
          loading={updateProfile.isPending}
          onPress={() =>
            updateProfile.mutate(
              { fullName: fullName.trim(), phone: phone.trim() || undefined },
              {
                onSuccess: () => toast.show('success', 'Profile updated'),
                onError: (error) => toast.show('error', 'Update failed', apiErrorMessage(error)),
              }
            )
          }
        />
      </View>

      {isOwner ? (
        <>
          <Divider style={{ marginVertical: spacing.xxl }} />
          <View style={{ gap: spacing.lg }}>
            <AppText variant="label" color="textMuted">
              Business
            </AppText>
            <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
            <Button
              title="Save business"
              variant="secondary"
              loading={updateBusiness.isPending}
              onPress={() => updateBusiness.mutate()}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}
