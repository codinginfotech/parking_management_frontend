import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/hooks/use-haptics';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  show: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const show = useCallback(
    (type: ToastType, title: string, message?: string) => {
      if (type === 'success') haptics.success();
      if (type === 'error') haptics.error();
      counter.current += 1;
      setToast({ id: counter.current, type, title, message });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3200);
    },
    []
  );

  const value = useMemo(() => ({ show }), [show]);

  const accent =
    toast?.type === 'success'
      ? colors.success
      : toast?.type === 'error'
        ? colors.danger
        : colors.textMuted;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={SlideInUp.springify().damping(18)}
          exiting={FadeOutUp.duration(180)}
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            top: insets.top + spacing.sm,
            left: spacing.lg,
            right: spacing.lg,
            backgroundColor: colors.surfaceHigh,
            borderRadius: radius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 4,
              alignSelf: 'stretch',
              borderRadius: 2,
              backgroundColor: accent,
            }}
          />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyMedium">{toast.title}</AppText>
            {toast.message ? (
              <AppText variant="bodySmall" color="textMuted">
                {toast.message}
              </AppText>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}
