import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface OccupancyRingProps {
  occupied: number;
  capacity: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

/**
 * The home screen hero: a gauge-like ring with a fine tick track, a gradient
 * progress arc that fills with occupancy, and a soft glow behind the count.
 * Shifts to warning/danger color as the lot approaches capacity.
 */
export function OccupancyRing({
  occupied,
  capacity,
  size = 260,
  strokeWidth = 8,
  children,
}: OccupancyRingProps) {
  const { colors, isDark } = useTheme();
  const ratio = capacity > 0 ? Math.min(1, occupied / capacity) : 0;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const critical = ratio >= 0.95;
  const busy = ratio >= 0.8;
  const flatColor = critical ? colors.danger : busy ? colors.warning : null;

  // Fine ticks just inside the ring — the automotive gauge detail.
  const tickCount = 72;
  const tickOuter = radius - strokeWidth / 2 - 5;
  const tickInner = tickOuter - 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const angle = (index / tickCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x1: center + tickInner * Math.cos(angle),
      y1: center + tickInner * Math.sin(angle),
      x2: center + tickOuter * Math.cos(angle),
      y2: center + tickOuter * Math.sin(angle),
      lit: index / tickCount <= ratio,
    };
  });

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={`${occupied} of ${capacity} spaces occupied`}
      accessibilityValue={{ min: 0, max: capacity, now: occupied }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.success} stopOpacity={1} />
          </LinearGradient>
          <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={isDark ? 0.1 : 0.05} />
            <Stop offset="70%" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx={center} cy={center} r={radius - strokeWidth} fill="url(#ringGlow)" />

        {ticks.map((tick, index) => (
          <Line
            key={index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={
              tick.lit
                ? (flatColor ?? colors.accent)
                : isDark
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(12,14,18,0.10)'
            }
            strokeOpacity={tick.lit ? 0.55 : 1}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}

        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceHigh}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={flatColor ?? 'url(#ringGradient)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}
