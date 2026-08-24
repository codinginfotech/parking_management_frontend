import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Parking: undefined;
  Activity: undefined;
  More: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Entry: undefined;
  Exit: { sessionId?: string } | undefined;
  Lots: undefined;
  LotCreate: undefined;
  LotDetail: { id: string };
  Staff: undefined;
  StaffCreate: undefined;
  Passes: undefined;
  PassCreate: undefined;
  Shift: undefined;
  Reports: undefined;
  Alerts: undefined;
  Profile: undefined;
};

export type RootParamList = AuthStackParamList & AppStackParamList;
