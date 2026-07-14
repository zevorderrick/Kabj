import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";
import { GuideTabsParamList, RootStackParamList } from "../../navigation/types";
import { colors, radius } from "../../theme";
import { GuideAvailability, GuideBookingDetailParams, GuideEarningsSummary } from "../../types";
import { useGuideProfile } from "./useGuideProfile";

type Props = CompositeScreenProps<
  BottomTabScreenProps<GuideTabsParamList, "Dashboard">,
  NativeStackScreenProps<RootStackParamList>
>;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function toBookingDetail(slot: GuideAvailability): GuideBookingDetailParams {
  return {
    touristName: "Ama Owusu",
    touristPhone: "024 123 4567",
    languagePreference: "English, Twi",
    specialRequests: "Wheelchair-friendly route preferred",
    meetupLatitude: 5.6037,
    meetupLongitude: -0.187,
    meetupLabel: "Independence Square, Accra",
    bookingDate: slot.availableDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
  };
}

export default function GuideDashboardScreen({ navigation }: Props) {
  const { profile, loading: profileLoading } = useGuideProfile();
  const [todaySlots, setTodaySlots] = useState<GuideAvailability[]>([]);
  const [bookedSlots, setBookedSlots] = useState<GuideAvailability[]>([]);
  const [earnings, setEarnings] = useState<GuideEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile) return;

    const today = formatDate(new Date());
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const toDate = formatDate(weekEnd);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const fromWeek = formatDate(weekStart);

    try {
      const [availability, earningsData] = await Promise.all([
        api.getGuideAvailability(profile.id, today, toDate),
        api.getGuideEarnings(profile.id),
      ]);

      setTodaySlots(availability.filter((s) => s.availableDate === today));
      setBookedSlots(availability.filter((s) => s.isBooked));
      setEarnings(earningsData);
    } catch {
      setTodaySlots([]);
      setBookedSlots([]);
    }
  }, [profile]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [profile, loadData])
  );

  const isBusy = profileLoading || loading;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.subheader}>
        {profile ? `Welcome back, ${profile.specialty} guide` : "Your guide hub"}
      </Text>

      {isBusy ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={styles.earningsCard}>
            <Text style={styles.cardLabel}>Weekly earnings</Text>
            <Text style={styles.earningsAmount}>
              GHS {earnings?.totalRevenue.toFixed(2) ?? "0.00"}
            </Text>
            <Text style={styles.earningsMeta}>
              Pending balance: GHS {earnings?.pendingBalance.toFixed(2) ?? "0.00"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Today's schedule</Text>
          {todaySlots.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyText}>No availability set for today</Text>
            </View>
          ) : (
            todaySlots.map((slot) => (
              <View key={slot.id} style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={styles.scheduleText}>
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </Text>
                <View style={[styles.badge, slot.isBooked ? styles.badgeBooked : styles.badgeOpen]}>
                  <Text style={styles.badgeText}>{slot.isBooked ? "Booked" : "Open"}</Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Booking requests</Text>
          {bookedSlots.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyText}>No active booking requests</Text>
            </View>
          ) : (
            bookedSlots.map((slot) => (
              <TouchableOpacity
                key={`booking-${slot.id}`}
                style={styles.requestCard}
                onPress={() => navigation.navigate("GuideBookingDetail", toBookingDetail(slot))}
              >
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>Tour booking</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
                <Text style={styles.requestMeta}>
                  {slot.availableDate} · {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </Text>
                <Text style={styles.requestHint}>Tap to view tourist details</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { fontSize: 24, fontWeight: "800", color: colors.text },
  subheader: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  earningsCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
  },
  cardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
  earningsAmount: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  earningsMeta: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  scheduleText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeOpen: { backgroundColor: "#dcfce7" },
  badgeBooked: { backgroundColor: "#fef3c7" },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.text },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  requestHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  requestTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  requestMeta: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  requestHint: { fontSize: 12, color: colors.primary, marginTop: 8, fontWeight: "600" },
});
