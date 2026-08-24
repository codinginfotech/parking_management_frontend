import { router } from '@/navigation/nav';
import { ArrowLeft, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useCreateStaff } from '@/features/profile/hooks';
import { apiErrorMessage, apiFieldErrors } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';

type StaffRole = 'ATTENDANT' | 'MANAGER';

export default function CreateStaffScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const create = useCreateStaff();
  const { lots } = useActiveLot();
  const user = useAuthStore((state) => state.user);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('ATTENDANT');
  const [assignedLotIds, setAssignedLotIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreateManagers = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const toggleLot = (lotId: string) =>
    setAssignedLotIds((current) =>
      current.includes(lotId)
        ? current.filter((id) => id !== lotId)
        : [...current, lotId]
    );

  const submit = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter the full name';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email';
    if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) next.phone = 'Enter a valid mobile number';
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
      next.password = 'Min 8 characters with letters and numbers';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    create.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        role,
        assignedLotIds,
      },
      {
        onSuccess: (staff) => {
          toast.show('success', 'Staff member added', staff.fullName);
          router.back();
        },
        onError: (error) => {
          setErrors(apiFieldErrors(error));
          toast.show('error', 'Could not add staff', apiErrorMessage(error));
        },
      }
    );
  };

  return (
    <Screen keyboardAvoiding>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">Add staff</AppText>
      </View>

      <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          placeholder="Ramesh Kumar"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ramesh@business.in"
        />
        <TextField
          label="Mobile (optional)"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="98765 43210"
        />
        <TextField
          label="Temporary password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          hint="They sign in with this â€” share it privately"
          placeholder="Set a password"
        />

        <View>
          <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.md }}>
            Role
          </AppText>
          <SegmentedControl
            options={[
              { value: 'ATTENDANT', label: 'Attendant' },
              ...(canCreateManagers ? [{ value: 'MANAGER' as StaffRole, label: 'Manager' }] : []),
            ]}
            value={role}
            onChange={setRole}
          />
        </View>

        {lots.length > 0 ? (
          <View>
            <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.sm }}>
              Assigned lots
            </AppText>
            <AppText variant="bodySmall" color="textFaint" style={{ marginBottom: spacing.sm }}>
              No selection means access to every lot.
            </AppText>
            {lots.map((lot, index) => (
              <ListRow
                key={lot._id}
                title={lot.name}
                divider={index < lots.length - 1}
                right={
                  assignedLotIds.includes(lot._id) ? (
                    <Check size={18} color={colors.accent} />
                  ) : undefined
                }
                onPress={() => toggleLot(lot._id)}
              />
            ))}
          </View>
        ) : null}

        <Button title="Add staff member" onPress={submit} loading={create.isPending} />
      </View>
    </Screen>
  );
}
