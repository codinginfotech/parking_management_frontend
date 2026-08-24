import React from 'react';
import { ScrollView, View } from 'react-native';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  scrollable?: boolean;
}

/** Compact selectable pills — the anti-card way to pick from a small set. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scrollable = false,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  const pills = options.map((option) => {
    const selected = option.value === value;
    return (
      <PressableScale
        key={option.value}
        onPress={() => onChange(option.value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={option.label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          minHeight: MIN_TOUCH,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.full,
          backgroundColor: selected ? colors.text : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.text : colors.hairline,
        }}
      >
        {option.icon}
        <AppText
          variant="bodyMedium"
          color={selected ? 'background' : 'textMuted'}
        >
          {option.label}
        </AppText>
      </PressableScale>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm }}
      >
        {pills}
      </ScrollView>
    );
  }
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{pills}</View>;
}
