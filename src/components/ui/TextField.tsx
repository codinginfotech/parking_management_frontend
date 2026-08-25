import { Eye, EyeOff } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { Pressable, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { radius, spacing, typography, useTheme } from '@/theme';
import { AppText } from './AppText';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  right?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, right, containerStyle, style, onFocus, onBlur, ...rest },
  ref
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.textFaint : colors.hairline;

  // Secure fields get a show/hide toggle automatically unless the caller
  // provides its own right-side accessory.
  const showToggle = Boolean(rest.secureTextEntry) && !right;
  const rightAccessory = showToggle ? (
    <Pressable
      onPress={() => setRevealed((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
      hitSlop={8}
    >
      {revealed ? (
        <EyeOff size={18} color={colors.textFaint} />
      ) : (
        <Eye size={18} color={colors.textFaint} />
      )}
    </Pressable>
  ) : (
    right
  );

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.sm }}>
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: spacing.lg,
        }}
      >
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={rest.secureTextEntry && !revealed}
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={colors.textFaint}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            typography.bodyMedium,
            { flex: 1, color: colors.text, paddingVertical: 14 },
            style,
          ]}
        />
        {rightAccessory}
      </View>
      {error ? (
        <AppText variant="bodySmall" color="danger" style={{ marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.xs }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});
