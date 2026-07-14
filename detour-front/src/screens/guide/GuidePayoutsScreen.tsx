import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../api/client";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";
import { colors, radius } from "../../theme";
import { GuideAvailability, GuideEarningsSummary } from "../../types";
import { useGuideProfile } from "./useGuideProfile";

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function GuidePayoutsScreen() {
  const { user } = useAuth();
  const { profile } = useGuideProfile();
  const [earnings, setEarnings] = useState<GuideEarningsSummary | null>(null);
  const [completedTrips, setCompletedTrips] = useState<GuideAvailability[]>([]);
  const [momoNumber, setMomoNumber] = useState(user?.phoneNumber ?? "");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);

      const [earningsData, availability] = await Promise.all([
        api.getGuideEarnings(profile.id),
        api.getGuideAvailability(profile.id, from, to),
      ]);

      setEarnings(earningsData);
      setCompletedTrips(availability.filter((s) => s.isBooked));
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not load payout data.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleWithdraw = async () => {
    if (!profile || !earnings) return;

    if (!momoNumber.trim()) {
      Alert.alert("Missing info", "Enter your Mobile Money number.");
      return;
    }

    if (earnings.pendingBalance <= 0) {
      Alert.alert("No balance", "You have no pending balance to withdraw.");
      return;
    }

    setWithdrawing(true);
    try {
      await api.requestGuidePayout(profile.id, earnings.pendingBalance, momoNumber.trim());
      Alert.alert(
        "Payout requested",
        `GHS ${earnings.pendingBalance.toFixed(2)} will be sent to ${momoNumber.trim()} once processed.`
      );
      await loadData();
    } catch (e: any) {
      Alert.alert("Withdrawal failed", e.message || "Could not request payout.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Payouts</Text>
      <Text style={styles.subheader}>Withdraw your earnings to Mobile Money</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Pending balance</Text>
            <Text style={styles.balanceAmount}>
              GHS {earnings?.pendingBalance.toFixed(2) ?? "0.00"}
            </Text>
            <Text style={styles.balanceMeta}>
              Total revenue: GHS {earnings?.totalRevenue.toFixed(2) ?? "0.00"} · Commission: GHS{" "}
              {earnings?.commissionAmount.toFixed(2) ?? "0.00"}
            </Text>
          </View>

          <Input
            label="Mobile Money number"
            value={momoNumber}
            onChangeText={setMomoNumber}
            keyboardType="phone-pad"
            placeholder="024 123 4567"
          />

          <Button
            title="Withdraw to Mobile Money"
            variant="accent"
            onPress={handleWithdraw}
            loading={withdrawing}
            disabled={(earnings?.pendingBalance ?? 0) <= 0}
          />

          <Text style={styles.sectionTitle}>Completed trips</Text>
          {completedTrips.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyText}>No completed trips yet</Text>
            </View>
          ) : (
            completedTrips.map((trip) => (
              <View key={trip.id} style={styles.tripRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripDate}>{trip.availableDate}</Text>
                  <Text style={styles.tripTime}>
                    {formatTime(trip.startTime)} – {formatTime(trip.endTime)}
                  </Text>
                </View>
              </View>
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
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  balanceAmount: { fontSize: 32, fontWeight: "800", color: colors.text, marginTop: 4 },
  balanceMeta: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 24, marginBottom: 10 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  tripDate: { fontSize: 14, fontWeight: "700", color: colors.text },
  tripTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
