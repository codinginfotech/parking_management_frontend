import React from 'react';
import { TextInput } from 'react-native';
import { radius, spacing, typography, useTheme } from '@/theme';
import { formatPlateInput } from '@/utils/plate';

interface PlateInputProps {
  value: string;
  onChange: (formatted: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
}

/**
 * The vehicle-entry centerpiece: a large plate field that formats Indian
 * registration numbers as they are typed ("MP04AB1234" -> "MP 04 AB 1234").
 */
export function PlateInput({ value, onChange, autoFocus, editable = true }: PlateInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onChange(formatPlateInput(text))}
      autoFocus={autoFocus}
      editable={editable}
      autoCapitalize="characters"
      autoCorrect={false}
      spellCheck={false}
      maxLength={15}
      placeholder="MP 04 AB 1234"
      placeholderTextColor={colors.textFaint}
      accessibilityLabel="Vehicle number"
      style={[
        typography.plate,
        {
          fontSize: 30,
          lineHeight: 38,
          color: colors.text,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xl,
          textAlign: 'center',
        },
      ]}
    />
  );
}
