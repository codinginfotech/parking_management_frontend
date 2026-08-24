import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Scrollable content (default) or a plain flex container for lists. */
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
  edgeTop?: boolean;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  keyboardAvoiding = false,
  edgeTop = true,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const base: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: edgeTop ? insets.top : 0,
    ...style,
  };

  const padding: ViewStyle = padded
    ? { paddingHorizontal: spacing.screen, paddingBottom: spacing.xxl }
    : {};

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <View style={base}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      </View>
    );
  }
  return <View style={base}>{body}</View>;
}
