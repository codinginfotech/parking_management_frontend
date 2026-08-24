import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const background =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? colors.danger
        : variant === 'secondary'
          ? colors.surfaceHigh
          : 'transparent';
  const textColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.onDanger
        : variant === 'ghost'
          ? colors.textMuted
          : colors.text;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={{
        backgroundColor: background,
        borderRadius: radius.lg,
        minHeight: size === 'lg' ? 54 : MIN_TOUCH,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        opacity: inactive ? 0.5 : 1,
        ...style,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <AppText variant={size === 'lg' ? 'headingM' : 'bodyMedium'} color={textColor}>
            {title}
          </AppText>
        </>
      )}
    </PressableScale>
  );
}
