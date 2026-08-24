import { router } from 'expo-router';
import { ArrowLeft, Plus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ROLE_LABELS } from '@/constants';
import { useStaff, useUpdateStaff } from '@/features/profile/hooks';
import { apiErrorMessage } from '@/services/api';
import { spacing, useTheme } from '@/theme';
import type { StaffMember } from '@/types/models';

export default function StaffScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const staff = useStaff();
  const updateStaff = useUpdateStaff();
  const [selected, setSelected] = useState<StaffMember | null>(null);

  const items = staff.data ?? [];

  return (
    <Screen refreshing={staff.isRefetching} onRefresh={() => void staff.refetch()}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
            <ArrowLeft size={22} color={colors.textMuted} />
          </Pressable>
          <AppText variant="headingXL">Staff</AppText>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/staff/create')}
          accessibilityRole="button"
          accessibilityLabel="Add staff member"
          hitSlop={12}
        >
          <Plus size={24} color={colors.accent} />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {staff.isLoading ? (
          <View style={{ gap: spacing.lg }}>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} height={56} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Users size={26} color={colors.textMuted} strokeWidth={1.6} />}
            title="No staff yet"
            message="Add attendants and managers so they can run entries, exits and shifts."
            actionTitle="Add staff member"
            onAction={() => router.push('/(app)/staff/create')}
          />
        ) : (
          items.map((member, index) => (
            <ListRow
              key={member.id}
              title={member.fullName}
              subtitle={`${ROLE_LABELS[member.role] ?? member.role} · ${member.email}`}
              divider={index < items.length - 1}
              right={
                <AppText variant="bodySmall" color={member.isActive ? 'success' : 'textFaint'}>
                  {member.isActive ? 'Active' : 'Disabled'}
                </AppText>
              }
              onPress={() => setSelected(member)}
            />
          ))
        )}
      </View>

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.fullName}
      >
        {selected ? (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.md }}>
              {ROLE_LABELS[selected.role] ?? selected.role} · {selected.email}
              {selected.phone ? ` · ${selected.phone}` : ''}
            </AppText>
            <Button
              title={selected.isActive ? 'Deactivate account' : 'Reactivate account'}
              variant={selected.isActive ? 'danger' : 'primary'}
              loading={updateStaff.isPending}
              onPress={() =>
                updateStaff.mutate(
                  { id: selected.id, isActive: !selected.isActive },
                  {
                    onSuccess: (updated) => {
                      toast.show(
                        'success',
                        updated.isActive ? 'Account reactivated' : 'Account deactivated'
                      );
                      setSelected(null);
                    },
                    onError: (error) =>
                      toast.show('error', 'Update failed', apiErrorMessage(error)),
                  }
                )
              }
            />
            <Button title="Close" variant="ghost" onPress={() => setSelected(null)} />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
