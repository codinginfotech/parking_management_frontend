import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Palette, typography, TypographyVariant, useTheme } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  /** A palette key, or any raw color string. */
  color?: keyof Palette | (string & {});
  align?: TextStyle['textAlign'];
}

export function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  const resolved =
    color in colors ? colors[color as keyof Palette] : (color as string);
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: resolved }, align ? { textAlign: align } : null, style]}
    >
      {children}
    </Text>
  );
}
