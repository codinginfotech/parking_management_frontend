import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

const OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

function fire(type: keyof typeof HapticFeedbackTypes): void {
  try {
    trigger(type, OPTIONS);
  } catch {
    // Fire-and-forget haptics — never let a haptic failure surface to the user.
  }
}

export const haptics = {
  tap(): void {
    fire('selection');
  },
  success(): void {
    fire('notificationSuccess');
  },
  warning(): void {
    fire('notificationWarning');
  },
  error(): void {
    fire('notificationError');
  },
  impact(): void {
    fire('impactMedium');
  },
};
