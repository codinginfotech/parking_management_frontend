import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import { Activity, CircleParking, House, Menu, Plus } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/hooks/use-haptics';
import { spacing, useTheme } from '@/theme';

const TAB_CONFIG = [
  { name: 'index', label: 'Home', Icon: House },
  { name: 'parking', label: 'Parking', Icon: CircleParking },
  { name: 'activity', label: 'Activity', Icon: Activity },
  { name: 'more', label: 'More', Icon: Menu },
] as const;

/**
 * Minimal four-tab bar with a raised accent action in the center for the most
 * frequent operation of the day: vehicle entry.
 */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const renderTab = (config: (typeof TAB_CONFIG)[number], index: number) => {
    const route = state.routes.find((r) => r.name === config.name);
    if (!route) return null;
    const focused = state.index === state.routes.indexOf(route);
    const { Icon } = config;
    return (
      <PressableScale
        key={config.name}
        haptic={false}
        onPress={() => {
          if (!focused) {
            haptics.tap();
            navigation.navigate(config.name);
          }
        }}
        accessibilityRole="tab"
        accessibilityLabel={config.label}
        accessibilityState={{ selected: focused }}
        style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: spacing.sm }}
      >
        <Icon
          size={22}
          color={focused ? colors.text : colors.textFaint}
          strokeWidth={focused ? 2.2 : 1.8}
        />
        <AppText
          variant="bodySmall"
          color={focused ? 'text' : 'textFaint'}
          style={{ fontSize: 10 }}
        >
          {config.label}
        </AppText>
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: focused ? colors.accent : 'transparent',
          }}
        />
      </PressableScale>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.hairline,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.sm,
      }}
    >
      {renderTab(TAB_CONFIG[0], 0)}
      {renderTab(TAB_CONFIG[1], 1)}
      <PressableScale
        onPress={() => {
          haptics.impact();
          router.push('/(app)/entry');
        }}
        accessibilityRole="button"
        accessibilityLabel="Vehicle entry"
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -22,
          shadowColor: colors.accent,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Plus size={26} color={colors.onAccent} strokeWidth={2.4} />
      </PressableScale>
      {renderTab(TAB_CONFIG[2], 2)}
      {renderTab(TAB_CONFIG[3], 3)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="parking" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
