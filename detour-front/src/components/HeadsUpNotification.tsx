import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme";
import { AppNotification } from "../types";

const AUTO_DISMISS_MS = 5000;
const SWIPE_UP_THRESHOLD = -36;
const SWIPE_SIDE_THRESHOLD = 90;

type Tone = "success" | "danger" | "warning" | "info";

function toneForType(type: string): Tone {
  const t = type.toUpperCase();
  if (t.includes("FAIL") || t.includes("REJECT")) return "danger";
  if (t.includes("SUCCESS") || t.includes("APPROV")) return "success";
  if (t.includes("INCIDENT") || t.includes("SAFETY") || t.includes("SOS")) return "warning";
  return "info";
}

const TONE_STYLES: Record<Tone, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: colors.success, icon: "checkmark-circle" },
  danger: { bg: colors.danger, icon: "alert-circle" },
  warning: { bg: colors.warning, icon: "shield-outline" },
  info: { bg: colors.primary, icon: "notifications" },
};

interface Props {
  notification: AppNotification;
  onDone: () => void;
  onPress?: (notification: AppNotification) => void;
}

/**
 * A single Android/iOS-style "heads-up" banner. Slides down over whatever is
 * on screen, sits for AUTO_DISMISS_MS, then slides away — or the user can
 * swipe it up/sideways to dismiss it early. Only ever renders one at a time;
 * stacking/queueing is handled by NotificationContext + HeadsUpNotificationHost.
 */
export default function HeadsUpNotification({ notification, onDone, onPress }: Props) {
  const insets = useSafeAreaInsets();
  const slideY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = useRef(false);

  const tone = useMemo(() => TONE_STYLES[toneForType(notification.type)], [notification.type]);

  const clearTimer = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  };

  const finish = (direction: "up" | "left" | "right" = "up") => {
    if (finished.current) return;
    finished.current = true;
    clearTimer();

    // "up" (auto-dismiss or upward swipe) slides the whole banner off the
    // top of the screen; "left"/"right" continues the sideways swipe the
    // user already started.
    const exitPan =
      direction === "left"
        ? { x: -420, y: 0 }
        : direction === "right"
        ? { x: 420, y: 0 }
        : { x: 0, y: 0 };

    Animated.parallel([
      Animated.timing(slideY, {
        toValue: direction === "up" ? -220 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(pan, {
        toValue: exitPan,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  };

  useEffect(() => {
    finished.current = false;
    slideY.setValue(-160);
    opacity.setValue(0);
    pan.setValue({ x: 0, y: 0 });

    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    dismissTimer.current = setTimeout(() => finish("up"), AUTO_DISMISS_MS);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 6 || gesture.dy < -6,
        onPanResponderGrant: () => {
          clearTimer();
        },
        onPanResponderMove: (_evt, gesture) => {
          // Only allow dragging up (out of view) or sideways — dragging down
          // is clamped to 0 since the banner is already docked at the top.
          pan.setValue({ x: gesture.dx, y: Math.min(0, gesture.dy) });
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dy < SWIPE_UP_THRESHOLD) {
            finish("up");
          } else if (gesture.dx > SWIPE_SIDE_THRESHOLD) {
            finish("right");
          } else if (gesture.dx < -SWIPE_SIDE_THRESHOLD) {
            finish("left");
          } else {
            // Snap back and resume the auto-dismiss countdown.
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }).start();
            dismissTimer.current = setTimeout(() => finish("up"), AUTO_DISMISS_MS);
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notification.id]
  );

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: insets.top + 6,
          opacity,
          transform: [
            { translateY: Animated.add(slideY, pan.y) },
            { translateX: pan.x },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { borderLeftColor: tone.bg }]}
        onPress={() => {
          onPress?.(notification);
          finish("up");
        }}
      >
        <View style={[styles.iconCircle, { backgroundColor: tone.bg }]}>
          <Ionicons name={tone.icon} size={18} color="#fff" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <View style={styles.dragHint} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: colors.text },
  message: { fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  dragHint: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginLeft: 8,
    alignSelf: "center",
  },
});
