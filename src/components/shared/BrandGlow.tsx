import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * A single, very soft volt bloom anchored top-right — depth for hero screens
 * without gradients or cards. Barely-there by design.
 */
export function BrandGlow() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const size = width * 1.3;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: -size * 0.45, right: -size * 0.35 }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="brandGlow" cx="50%" cy="50%" r="50%">
            <Stop
              offset="0%"
              stopColor={colors.accent}
              stopOpacity={isDark ? 0.14 : 0.08}
            />
            <Stop offset="55%" stopColor={colors.accent} stopOpacity={isDark ? 0.04 : 0.02} />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={size / 2}
          cy={size / 2}
          rx={size / 2}
          ry={size / 2}
          fill="url(#brandGlow)"
        />
      </Svg>
    </View>
  );
}
