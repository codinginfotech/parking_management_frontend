import * as Haptics from 'expo-haptics';

/** Fire-and-forget haptics — never let a haptic failure surface to the user. */
export const haptics = {
  tap(): void {
    Haptics.selectionAsync().catch(() => {});
  },
  success(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  error(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
  impact(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
};
