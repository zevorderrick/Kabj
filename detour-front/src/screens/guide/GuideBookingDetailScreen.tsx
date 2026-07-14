import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Button from "../../components/Button";
import { RootStackParamList } from "../../navigation/types";
import { colors, radius } from "../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "GuideBookingDetail">;

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function GuideBookingDetailScreen({ route, navigation }: Props) {
  const {
    touristName,
    touristPhone,
    languagePreference,
    specialRequests,
    meetupLatitude,
    meetupLongitude,
    meetupLabel,
    bookingDate,
    startTime,
    endTime,
  } = route.params;

  const openNavigation = () => {
    const lat = meetupLatitude;
    const lng = meetupLongitude;
    const label = encodeURIComponent(meetupLabel);
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${label}@${lat},${lng}`
        : `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      );
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Booking details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tourist</Text>
        <Row icon="person-outline" label="Name" value={touristName} />
        {touristPhone ? <Row icon="call-outline" label="Phone" value={touristPhone} /> : null}
        <Row icon="language-outline" label="Language preference" value={languagePreference} />
        {specialRequests ? (
          <Row icon="chatbubble-outline" label="Special requests" value={specialRequests} />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Schedule</Text>
        <Row icon="calendar-outline" label="Date" value={bookingDate} />
        <Row
          icon="time-outline"
          label="Time"
          value={`${formatTime(startTime)} – ${formatTime(endTime)}`}
        />
      </View>

      <View style={styles.mapWrap}>
        <Text style={styles.cardTitle}>Meetup point</Text>
        <Text style={styles.meetupLabel}>{meetupLabel}</Text>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: meetupLatitude,
            longitude: meetupLongitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude: meetupLatitude, longitude: meetupLongitude }}
            title={meetupLabel}
          />
        </MapView>
      </View>

      <Button
        title="Navigate to meetup point"
        variant="accent"
        onPress={openNavigation}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: { fontSize: 18, fontWeight: "800", color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  rowLabel: { fontSize: 11, color: colors.textMuted },
  rowValue: { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 2 },
  mapWrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  meetupLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  map: { height: 180, borderRadius: radius.sm },
});
