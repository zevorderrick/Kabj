import React from "react";
import { useNotifications } from "../context/NotificationContext";
import { AppNotification } from "../types";
import HeadsUpNotification from "./HeadsUpNotification";

/**
 * Sits once at the root of the app (see App.tsx) and renders whichever
 * notification NotificationContext currently wants shown as a heads-up
 * banner. Rendering is keyed by notification id so a fresh mount/animation
 * happens for every new banner, even if the previous one is dismissed
 * instantly (e.g. rapid swipes).
 */
export default function HeadsUpNotificationHost() {
  const { activeNotification, dismissActive, markRead } = useNotifications();

  if (!activeNotification) return null;

  const handlePress = (notification: AppNotification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
  };

  return (
    <HeadsUpNotification
      key={activeNotification.id}
      notification={activeNotification}
      onDone={dismissActive}
      onPress={handlePress}
    />
  );
}
