import React from 'react';
import { View } from 'react-native';
import { VEHICLE_TYPE_OPTIONS } from '@/constants';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import type { VehicleType } from '@/types/models';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

interface VehicleTypeSelectorProps {
  value: VehicleType | null;
  onChange: (value: VehicleType) => void;
}

export function VehicleTypeSelector({ value, onChange }: VehicleTypeSelectorProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {VEHICLE_TYPE_OPTIONS.map(({ value: type, label, Icon }) => {
        const selected = type === value;
        return (
          <PressableScale
            key={type}
            onPress={() => onChange(type)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={{
              flex: 1,
              minHeight: MIN_TOUCH + 18,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: spacing.md,
              backgroundColor: selected ? colors.surfaceHigh : 'transparent',
              borderWidth: 1,
              borderColor: selected ? colors.text : colors.hairline,
            }}
          >
            <Icon size={20} color={selected ? colors.text : colors.textFaint} strokeWidth={1.8} />
            <AppText
              variant="bodySmall"
              color={selected ? 'text' : 'textMuted'}
              align="center"
              numberOfLines={1}
              style={{ fontSize: 11 }}
            >
              {label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}
