import React from 'react';
import { View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from '../ui/AppText';

interface PlateBadgeProps {
  number: string;
  size?: 'lg' | 'md';
}

/**
 * A registration number rendered as a physical plate — bordered lozenge,
 * wide tracking, tabular digits. Used at confirmation moments.
 */
export function PlateBadge({ number, size = 'lg' }: PlateBadgeProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.text,
        paddingVertical: size === 'lg' ? spacing.md : spacing.sm,
        paddingHorizontal: size === 'lg' ? spacing.xxl : spacing.xl,
      }}
      accessibilityLabel={`Vehicle number ${number}`}
    >
      <AppText
        variant="plate"
        style={{
          fontSize: size === 'lg' ? 26 : 20,
          lineHeight: size === 'lg' ? 34 : 26,
          letterSpacing: size === 'lg' ? 3 : 2,
        }}
      >
        {number}
      </AppText>
    </View>
  );
}
