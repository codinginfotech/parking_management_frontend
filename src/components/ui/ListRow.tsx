import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { MIN_TOUCH, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Divider } from './Divider';
import { PressableScale } from './PressableScale';

interface ListRowProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  divider?: boolean;
  destructive?: boolean;
}

/** Full-width row with a hairline — list structure without card chrome. */
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  chevron = false,
  onPress,
  divider = true,
  destructive = false,
}: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        minHeight: MIN_TOUCH + 12,
        paddingVertical: spacing.md,
      }}
    >
      {icon ? <View style={{ width: 24, alignItems: 'center' }}>{icon}</View> : null}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium" color={destructive ? 'danger' : 'text'}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color="textMuted" style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {chevron ? <ChevronRight size={18} color={colors.textFaint} /> : null}
    </View>
  );

  return (
    <View>
      {onPress ? (
        <PressableScale scaleTo={0.99} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
          {content}
        </PressableScale>
      ) : (
        content
      )}
      {divider ? <Divider /> : null}
    </View>
  );
}
