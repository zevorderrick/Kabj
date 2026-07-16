import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import {Image} from "expo-image";

type Props = NativeStackScreenProps<RootStackParamList, "AttractionDetail">;

export default function AttractionDetailScreen({ route, navigation }: Props) {
  const { attraction } = route.params;

  return (
    /*<View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>*/
    <View style={styles.container}>
  <View style={styles.imageContainer}>
    {attraction.imageUrl ? (
      <Image
        source={{ uri: attraction.imageUrl }}
        style={StyleSheet.absoluteFillObject} // Spans the entire header area
        contentFit="cover"
        transition={500}
      />
    ) : (
      // Fallback if there is no image in the database
      <Ionicons name="image-outline" size={40} color={colors.textMuted} />
    )}
    
    {/* The back button stays floating on top of the image */}
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>{attraction.title}</Text>
        <Text style={styles.location}>
          {attraction.region} Region, Ghana
        </Text>

        {attraction.popularityCount != null && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.accentDark} />
            <Text style={styles.ratingText}>{attraction.popularityCount} interested travelers</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <InfoItem icon="pricetag-outline" label="Category" value={attraction.category} />
          {attraction.basePrice != null && (
            <InfoItem
              icon="cash-outline"
              label="Base Price"
              value={`GHS ${Number(attraction.basePrice).toFixed(2)}`}
            />
          )}
          {attraction.ecoScore != null && (
            <InfoItem icon="leaf-outline" label="Eco Score" value={`${attraction.ecoScore} / 5`} />
          )}
          <InfoItem
            icon="location-outline"
            label="Coordinates"
            value={`${attraction.latitude}, ${attraction.longitude}`}
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {attraction.description || "No description provided yet for this attraction."}
        </Text>

        <Text style={styles.note}>
          Note: amenities, opening hours, distance, and photos shown in the original design aren't
          part of the Attraction entity yet — add those columns to enable them here.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Book a Tour" onPress={() => navigation.navigate("BookTour", { attraction })} />
      </View>
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  /*imagePlaceholder: {
    height: 260,
    backgroundColor: "#dcd9cf",
    alignItems: "center",
    justifyContent: "center",
  },*/
  // Find your styles and replace 'imagePlaceholder' with this:
  imageContainer: {
    height: 260,
    backgroundColor: "#dcd9cf",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden", // ⚠️ Prevents the image from bleeding out of the rounded corners if any
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  body: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  location: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  ratingText: { fontSize: 13, color: colors.textMuted, marginLeft: 4 },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  infoItem: { flexDirection: "row", alignItems: "center" },
  infoLabel: { fontSize: 11, color: colors.textMuted },
  infoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 22, marginBottom: 8 },
  description: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  note: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 18,
    fontStyle: "italic",
    lineHeight: 17,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
