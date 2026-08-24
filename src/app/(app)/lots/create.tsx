import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LotForm } from '@/components/parking/LotForm';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { apiErrorMessage } from '@/services/api';
import { CreateLotPayload, lotsService } from '@/services/parking.service';
import { useLotStore } from '@/store/lot.store';
import { spacing, useTheme } from '@/theme';

export default function CreateLotScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const setActiveLot = useLotStore((state) => state.setActiveLot);

  const create = useMutation({
    mutationFn: (payload: CreateLotPayload) => lotsService.create(payload),
    onSuccess: (lot) => {
      void queryClient.invalidateQueries({ queryKey: ['lots'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      setActiveLot(lot._id);
      toast.show('success', 'Parking lot created', lot.name);
      router.back();
    },
    onError: (error) => toast.show('error', 'Could not create lot', apiErrorMessage(error)),
  });

  return (
    <Screen keyboardAvoiding>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">New parking lot</AppText>
      </View>
      <AppText variant="body" color="textMuted" style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Every enabled vehicle type needs pricing — exits are always billable.
      </AppText>
      <LotForm submitting={create.isPending} onSubmit={(payload) => create.mutate(payload)} />
    </Screen>
  );
}
