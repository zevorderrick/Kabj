import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api/client";
import { AppNotification } from "../types";
import { useAuth } from "./AuthContext";

const POLL_INTERVAL_MS = 15000;
const LAST_SEEN_KEY_PREFIX = "detour_notif_last_seen_id_";

interface NotificationContextType {
  /** Notification currently animating on screen, or null if none is showing. */
  activeNotification: AppNotification | null;
  /** Number of unread notifications, kept in sync with the backend. */
  unreadCount: number;
  /** Call once the on-screen banner has finished its exit animation. */
  dismissActive: () => void;
  /** Mark a notification read (e.g. when the user taps the banner). */
  markRead: (id: number) => void;
  /** Force an immediate refresh (e.g. pull-to-refresh on Home). */
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  activeNotification: null,
  unreadCount: 0,
  dismissActive: () => {},
  markRead: () => {},
  refresh: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<AppNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(
    null
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // Highest notification id we've already surfaced/considered "seen", so we
  // only ever show a heads-up banner for genuinely new notifications rather
  // than replaying the user's whole history every time the app opens.
  const lastSeenIdRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Promote the next queued notification onto the screen once the current
  // one has finished animating away.
  useEffect(() => {
    if (!activeNotification && queue.length > 0) {
      const [next, ...rest] = queue;
      setActiveNotification(next);
      setQueue(rest);
    }
  }, [activeNotification, queue]);

  const poll = useCallback(async () => {
    if (!user?.id) return;
    try {
      const storageKey = `${LAST_SEEN_KEY_PREFIX}${user.id}`;

      if (!initializedRef.current) {
        // First run after login/app-open: establish a baseline so we don't
        // flood the user with heads-up banners for old notifications.
        const stored = await AsyncStorage.getItem(storageKey);
        lastSeenIdRef.current = stored ? Number(stored) : null;
        initializedRef.current = true;
      }

      const [notifications, unread] = await Promise.all([
        api.getNotifications(user.id),
        api.getUnreadNotificationCount(user.id),
      ]);

      setUnreadCount(unread.count);

      if (notifications.length === 0) return;

      const maxId = Math.max(...notifications.map((n) => n.id));

      if (lastSeenIdRef.current == null) {
        // Nothing seen yet on this device: don't burst-show history, just
        // set the baseline to "now" so future polls only surface new ones.
        lastSeenIdRef.current = maxId;
        await AsyncStorage.setItem(storageKey, String(maxId));
        return;
      }

      const fresh = notifications
        .filter((n) => n.id > lastSeenIdRef.current!)
        .sort((a, b) => a.id - b.id);

      if (fresh.length > 0) {
        setQueue((prev) => [...prev, ...fresh]);
        lastSeenIdRef.current = maxId;
        await AsyncStorage.setItem(storageKey, String(maxId));
      }
    } catch {
      // Silent failure is fine here — polling just retries next interval,
      // and we don't want a heads-up notification error surfacing about
      // notifications themselves.
    }
  }, [user?.id]);

  useEffect(() => {
    initializedRef.current = false;
    lastSeenIdRef.current = null;
    setQueue([]);
    setActiveNotification(null);
    setUnreadCount(0);

    if (!user?.id) return;

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user?.id, poll]);

  const dismissActive = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const markRead = useCallback((id: number) => {
    setUnreadCount((c) => Math.max(0, c - 1));
    api.markNotificationRead(id).catch(() => {
      // If this fails, the next poll's unread-count call will resync.
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{ activeNotification, unreadCount, dismissActive, markRead, refresh: poll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
