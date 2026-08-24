import React from 'react';
import { View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from '../ui/AppText';

interface BarDatum {
  label: string;
  value: number;
  display?: string;
}

/** Horizontal proportion bars — breakdowns without a chart library. */
export function HorizontalBars({ data }: { data: BarDatum[] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((entry) => entry.value));
  return (
    <View style={{ gap: spacing.md }}>
      {data.map((entry) => (
        <View key={entry.label}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: spacing.xs,
            }}
          >
            <AppText variant="bodySmall" color="textMuted">
              {entry.label}
            </AppText>
            <AppText variant="bodySmall">{entry.display ?? entry.value}</AppText>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.surfaceHigh,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${(entry.value / max) * 100}%`,
                height: '100%',
                borderRadius: 3,
                backgroundColor: colors.accent,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

interface ColumnDatum {
  label: string;
  value: number;
}

/** Compact column chart used for peak hours and revenue trends. */
export function ColumnChart({
  data,
  height = 120,
  highlightMax = true,
}: {
  data: ColumnDatum[];
  height?: number;
  highlightMax?: boolean;
}) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((entry) => entry.value));
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height,
          gap: 3,
        }}
      >
        {data.map((entry, index) => {
          const isMax = highlightMax && entry.value === max && entry.value > 0;
          return (
            <View
              key={`${entry.label}-${index}`}
              style={{
                flex: 1,
                height: Math.max(3, (entry.value / max) * height),
                borderRadius: radius.sm / 2,
                backgroundColor: isMax
                  ? colors.accent
                  : entry.value > 0
                    ? colors.surfaceHigh
                    : colors.skeleton,
              }}
              accessibilityLabel={`${entry.label}: ${entry.value}`}
            />
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.xs,
        }}
      >
        <AppText variant="bodySmall" color="textFaint">
          {data[0]?.label}
        </AppText>
        <AppText variant="bodySmall" color="textFaint">
          {data[data.length - 1]?.label}
        </AppText>
      </View>
    </View>
  );
}
