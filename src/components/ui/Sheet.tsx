import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * A gesture-driven bottom sheet: fades the backdrop, slides the panel, and
 * dismisses on downward drag or backdrop tap.
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);

  const translateY = useSharedValue(windowHeight);
  const backdrop = useSharedValue(0);

  const finishClose = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
      backdrop.value = withTiming(1, { duration: 250 });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(
        windowHeight,
        { duration: 260, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(finishClose)();
        }
      );
    }
  }, [visible, mounted, windowHeight, translateY, backdrop, finishClose]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 110 || event.velocityY > 900) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { position: 'absolute', inset: 0, backgroundColor: colors.overlay },
            backdropStyle,
          ]}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={onClose}
            accessibilityLabel="Close sheet"
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingHorizontal: spacing.screen,
                paddingBottom: insets.bottom + spacing.xl,
                maxHeight: windowHeight * 0.85,
              },
              panelStyle,
            ]}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.hairline,
                marginTop: spacing.md,
                marginBottom: spacing.lg,
              }}
            />
            {title ? (
              <AppText variant="headingL" style={{ marginBottom: spacing.lg }}>
                {title}
              </AppText>
            ) : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
