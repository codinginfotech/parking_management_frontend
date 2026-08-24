import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { PAYMENT_METHOD_OPTIONS } from '@/constants';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import type { PaymentMethod } from '@/types/models';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

const METHOD_ICONS = {
  CASH: Banknote,
  UPI: Smartphone,
  CARD: CreditCard,
  OTHER: Wallet,
} as const;

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod) => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {PAYMENT_METHOD_OPTIONS.map(({ value: method, label }) => {
        const Icon = METHOD_ICONS[method];
        const selected = method === value;
        return (
          <PressableScale
            key={method}
            onPress={() => onChange(method)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Pay by ${label}`}
            style={{
              flex: 1,
              minHeight: MIN_TOUCH + 16,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: selected ? colors.surfaceHigh : 'transparent',
              borderWidth: 1,
              borderColor: selected ? colors.text : colors.hairline,
            }}
          >
            <Icon size={19} color={selected ? colors.text : colors.textFaint} strokeWidth={1.8} />
            <AppText variant="bodySmall" color={selected ? 'text' : 'textMuted'} style={{ fontSize: 11 }}>
              {label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}
