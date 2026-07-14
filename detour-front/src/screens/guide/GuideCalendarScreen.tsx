import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";
import { colors, radius } from "../../theme";
import { GuideAvailability } from "../../types";
import { useGuideProfile } from "./useGuideProfile";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function GuideCalendarScreen() {
  const { profile } = useGuideProfile();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [availability, setAvailability] = useState<GuideAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const slot of availability) {
      set.add(slot.availableDate);
    }
    return set;
  }, [availability]);

  const loadMonth = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    const from = toIsoDate(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = toIsoDate(year, month, lastDay);

    setLoading(true);
    try {
      const data = await api.getGuideAvailability(profile.id, from, to);
      setAvailability(data);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not load availability.");
    } finally {
      setLoading(false);
    }
  }, [profile, year, month]);

  useFocusEffect(
    useCallback(() => {
      loadMonth();
    }, [loadMonth])
  );

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const toggleDate = async (day: number) => {
    if (!profile) return;

    const dateStr = toIsoDate(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(year, month, day);
    if (selected < today) {
      Alert.alert("Past date", "You can only set availability for future dates.");
      return;
    }

    if (availableDates.has(dateStr)) {
      Alert.alert(
        "Already available",
        "This date already has availability. Add another time slot from your dashboard if needed."
      );
      return;
    }

    setTogglingDate(dateStr);
    try {
      const slot = await api.setGuideAvailability(profile.id, {
        date: dateStr,
        startTime: "09:00:00",
        endTime: "17:00:00",
      });
      setAvailability((prev) => [...prev, slot]);
    } catch (e: any) {
      Alert.alert("Could not set availability", e.message || "Please try again.");
    } finally {
      setTogglingDate(null);
    }
  };

  const monthSlots = availability.filter((s) => s.availableDate.startsWith(`${year}-${pad(month + 1)}`));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Calendar</Text>
      <Text style={styles.subheader}>Tap a date to mark yourself available (9 AM – 5 PM)</Text>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            if (day == null) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }

            const dateStr = toIsoDate(year, month, day);
            const isAvailable = availableDates.has(dateStr);
            const isToggling = togglingDate === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dayCell, isAvailable && styles.dayAvailable]}
                onPress={() => toggleDate(day)}
                disabled={isToggling}
              >
                <Text style={[styles.dayText, isAvailable && styles.dayTextAvailable]}>{day}</Text>
                {isAvailable ? <View style={styles.dot} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>This month</Text>
      {monthSlots.length === 0 ? (
        <Text style={styles.muted}>No availability set yet.</Text>
      ) : (
        monthSlots.map((slot) => (
          <View key={slot.id} style={styles.slotRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.slotText}>
              {slot.availableDate} · {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              {slot.isBooked ? " · Booked" : ""}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { fontSize: 24, fontWeight: "800", color: colors.text },
  subheader: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekday: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  dayAvailable: { backgroundColor: "#dcfce7" },
  dayText: { fontSize: 14, fontWeight: "600", color: colors.text },
  dayTextAvailable: { color: colors.primary },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10 },
  muted: { color: colors.textMuted, fontSize: 14 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  slotText: { fontSize: 13, color: colors.text, flex: 1 },
});
