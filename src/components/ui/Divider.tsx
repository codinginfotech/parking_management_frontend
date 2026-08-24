import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

/** A hairline — the primary structural element instead of card borders. */
export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[{ height: 1, backgroundColor: colors.hairline, width: '100%' }, style]}
    />
  );
}
