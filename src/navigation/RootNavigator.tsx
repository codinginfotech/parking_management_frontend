import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Activity as ActivityIcon, CircleParking, House, Menu, Plus } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/hooks/use-haptics';
import { useRealtimeUpdates } from '@/hooks/use-realtime';
import { router, navigationRef } from '@/navigation/nav';
import AlertsScreen from '@/screens/alerts';
import LoginScreen from '@/screens/auth/login';
import RegisterScreen from '@/screens/auth/register';
import EntryScreen from '@/screens/entry';
import ExitScreen from '@/screens/exit';
import LotCreateScreen from '@/screens/lots/create';
import LotDetailScreen from '@/screens/lots/detail';
import LotsScreen from '@/screens/lots/list';
import PassCreateScreen from '@/screens/passes/create';
import PassesScreen from '@/screens/passes/list';
import ProfileScreen from '@/screens/profile';
import ReportsScreen from '@/screens/reports';
import ShiftScreen from '@/screens/shift';
import StaffCreateScreen from '@/screens/staff/create';
import StaffScreen from '@/screens/staff/list';
import ActivityScreen from '@/screens/tabs/activity';
import HomeScreen from '@/screens/tabs/home';
import MoreScreen from '@/screens/tabs/more';
import ParkingScreen from '@/screens/tabs/parking';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';
import type { AppStackParamList, AuthStackParamList, TabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_CONFIG = [
  { name: 'Home', label: 'Home', Icon: House },
  { name: 'Parking', label: 'Parking', Icon: CircleParking },
  { name: 'Activity', label: 'Activity', Icon: ActivityIcon },
  { name: 'More', label: 'More', Icon: Menu },
] as const;

/**
 * Minimal four-tab bar with a raised accent action in the center for the most
 * frequent operation of the day: vehicle entry.
 */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const renderTab = (config: (typeof TAB_CONFIG)[number]) => {
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
      {renderTab(TAB_CONFIG[0])}
      {renderTab(TAB_CONFIG[1])}
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
      {renderTab(TAB_CONFIG[2])}
      {renderTab(TAB_CONFIG[3])}
    </View>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Parking" component={ParkingScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  useRealtimeUpdates();

  return (
    <>
      <OfflineBanner />
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <AppStack.Screen name="Tabs" component={TabsNavigator} />
        <AppStack.Screen
          name="Entry"
          component={EntryScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <AppStack.Screen
          name="Exit"
          component={ExitScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <AppStack.Screen name="Lots" component={LotsScreen} />
        <AppStack.Screen name="LotCreate" component={LotCreateScreen} />
        <AppStack.Screen name="LotDetail" component={LotDetailScreen} />
        <AppStack.Screen name="Staff" component={StaffScreen} />
        <AppStack.Screen name="StaffCreate" component={StaffCreateScreen} />
        <AppStack.Screen name="Passes" component={PassesScreen} />
        <AppStack.Screen name="PassCreate" component={PassCreateScreen} />
        <AppStack.Screen name="Shift" component={ShiftScreen} />
        <AppStack.Screen name="Reports" component={ReportsScreen} />
        <AppStack.Screen name="Alerts" component={AlertsScreen} />
        <AppStack.Screen name="Profile" component={ProfileScreen} />
      </AppStack.Navigator>
    </>
  );
}

function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  return (
    <NavigationContainer ref={navigationRef}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
