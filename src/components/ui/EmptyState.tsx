import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionTitle, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={{
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.surfaceHigh,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
          }}
        >
          {icon}
        </View>
      ) : null}
      <AppText variant="headingL" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          size="md"
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Animated.View>
  );
}
