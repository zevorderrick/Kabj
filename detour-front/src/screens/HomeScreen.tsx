import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Attraction } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 20;
const CARD_GAP = 12;
const REC_CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const HERO_WIDTH = SCREEN_WIDTH - H_PAD * 2;
const HERO_HEIGHT = 190;
const GOLD = "#E8B830";

const CATEGORIES = [
  { label: "Attractions", icon: "business-outline" as const, bg: "#dcfce7", color: "#16a34a" },
  { label: "Tours", icon: "airplane-outline" as const, bg: "#fef9c3", color: "#ca8a04" },
  { label: "Events", icon: "ticket-outline" as const, bg: "#dbeafe", color: "#2563eb" },
  { label: "Food", icon: "restaurant-outline" as const, bg: "#ffedd5", color: "#ea580c" },
  { label: "More", icon: "ellipsis-horizontal" as const, bg: "#f3f4f6", color: "#6b7280" },
];

function CardGradient() {
  return (
    <View style={styles.cardGradient} pointerEvents="none">
      <View style={[styles.gradientLayer, { height: "30%", opacity: 0.2 }]} />
      <View style={[styles.gradientLayer, { height: "50%", opacity: 0.45 }]} />
      <View style={[styles.gradientLayer, { height: "70%", opacity: 0.7 }]} />
    </View>
  );
}

function RecommendedCard({
  attraction,
  onPress,
}: {
  attraction: Attraction;
  onPress: () => void;
}) {
  const rating =
    attraction.averageRating != null
      ? Number(attraction.averageRating).toFixed(1)
      : null;
  const reviewCount = attraction.reviewCount ?? 0;

  return (
    <TouchableOpacity
      style={[styles.recCard, { width: REC_CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {attraction.imageUrl ? (
        <Image source={{ uri: attraction.imageUrl }} style={styles.recImage} resizeMode="cover" />
      ) : (
        <View style={[styles.recImage, styles.recImageFallback]}>
          <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <CardGradient />
      <View style={styles.recTextStack}>
        <Text style={styles.recTitle} numberOfLines={2}>
          {attraction.title}
        </Text>
        {rating && (
          <View style={styles.recMetaRow}>
            <Ionicons name="star" size={11} color={GOLD} />
            <Text style={styles.recMetaText}>
              {rating} ({reviewCount})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function DestinationCard({
  title,
  imageUrl,
  onPress,
}: {
  title: string;
  imageUrl?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.destCard} onPress={onPress} activeOpacity={0.9}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.destImage} resizeMode="cover" />
      ) : (
        <View style={[styles.destImage, styles.recImageFallback]}>
          <Ionicons name="map-outline" size={20} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <CardGradient />
      <Text style={styles.destTitle} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("Accra, Greater Accra");
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getAttractions();
      setAttractions(data);
    } catch (e: any) {
      setError(e.message || "Could not reach the DeTour backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (place) {
          const city = place.city || place.district || place.subregion;
          const region = place.region;
          if (city && region) setLocationLabel(`${city}, ${region}`);
          else if (city) setLocationLabel(city);
        }
      } catch {
        // keep default label
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      attractions.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.region.toLowerCase().includes(search.toLowerCase()) ||
          a.category.toLowerCase().includes(search.toLowerCase())
      ),
    [attractions, search]
  );

  const featured = useMemo(
    () => (filtered.length > 0 ? filtered.slice(0, 3) : []),
    [filtered]
  );

  const recommended = useMemo(
    () => (filtered.length > 0 ? filtered.slice(0, 4) : []),
    [filtered]
  );

  const popularDestinations = useMemo(() => {
    const byRegion = new Map<string, Attraction>();
    for (const a of attractions) {
      if (!byRegion.has(a.region)) byRegion.set(a.region, a);
    }
    return Array.from(byRegion.entries()).map(([region, attraction]) => ({
      region,
      imageUrl: attraction.imageUrl,
    }));
  }, [attractions]);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    setHeroIndex(index);
  };

  const goToExplore = () => navigation.navigate("MainTabs", { screen: "Explore" });

  const openAttraction = (attraction: Attraction) =>
    navigation.navigate("AttractionDetail", { attraction });

  const heroSubtitle = (attraction: Attraction) => {
    if (attraction.description) {
      const trimmed = attraction.description.trim();
      return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
    }
    return `${attraction.category} · ${attraction.region}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Hello, {user?.name?.split(" ")[0] || "Explorer"} 👋
              </Text>
              <Text style={styles.question}>Where to today?</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => navigation.navigate("MainTabs", { screen: "Safety" })}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search attractions, places, guides..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity onPress={goToExplore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="options-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure your Spring Boot API is running and BASE_URL in src/api/client.ts points to it.
            </Text>
          </View>
        ) : (
          <>
            {featured.length > 0 && (
              <View style={styles.heroSection}>
                <ScrollView
                  ref={heroRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onHeroScroll}
                  decelerationRate="fast"
                  snapToInterval={HERO_WIDTH}
                  contentContainerStyle={styles.heroScroll}
                >
                  {featured.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.heroCard, { width: HERO_WIDTH }]}
                      onPress={() => openAttraction(item)}
                      activeOpacity={0.95}
                    >
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.heroImage, styles.recImageFallback]}>
                          <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
                        </View>
                      )}
                      <CardGradient />
                      <View style={styles.heroTextStack}>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle}>{heroSubtitle(item)}</Text>
                      </View>
                      <View style={styles.heroArrow}>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.heroDots}>
                  {featured.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.heroDot, i === heroIndex && styles.heroDotActive]}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.categoriesRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={styles.categoryItem}
                  onPress={goToExplore}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryCircle, { backgroundColor: cat.bg }]}>
                    <Ionicons name={cat.icon} size={22} color={cat.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {search ? `Results for "${search}"` : "Recommended for you"}
              </Text>
              {!search && (
                <TouchableOpacity onPress={goToExplore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>

            {recommended.length > 0 ? (
              <View style={styles.recGrid}>
                {recommended.map((item) => (
                  <RecommendedCard
                    key={item.id}
                    attraction={item}
                    onPress={() => openAttraction(item)}
                  />
                ))}
              </View>
            ) : !loading ? (
              <Text style={styles.empty}>No attractions found. Add some via your backend.</Text>
            ) : null}

            {popularDestinations.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, styles.popularTitle]}>Popular Destinations</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.destScroll}
                >
                  {popularDestinations.map(({ region, imageUrl }) => (
                    <DestinationCard
                      key={region}
                      title={region}
                      imageUrl={imageUrl}
                      onPress={goToExplore}
                    />
                  ))}
                </ScrollView>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 24 },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: H_PAD,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerText: { flex: 1 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "700" },
  question: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 4 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  notifButton: { position: "relative", paddingTop: 4 },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.pill,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  heroSection: { marginTop: 20, paddingHorizontal: H_PAD },
  heroScroll: { gap: 0 },
  heroCard: {
    height: HERO_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroTextStack: {
    position: "absolute",
    left: 16,
    right: 48,
    bottom: 16,
  },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  heroSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2 },
  heroArrow: {
    position: "absolute",
    right: 14,
    bottom: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  heroDotActive: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginTop: 24,
  },
  categoryItem: { alignItems: "center", width: (SCREEN_WIDTH - H_PAD * 2) / 5 },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    marginTop: 6,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  seeAll: { fontSize: 14, fontWeight: "600", color: colors.primary },
  recGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    gap: CARD_GAP,
  },
  recCard: {
    height: REC_CARD_WIDTH * 1.15,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
  },
  recImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  recImageFallback: {
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  gradientLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  recTextStack: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  recTitle: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 17 },
  recMetaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  recMetaText: { color: "rgba(255,255,255,0.9)", fontSize: 11 },
  popularTitle: {
    paddingHorizontal: H_PAD,
    marginTop: 28,
    marginBottom: 14,
  },
  destScroll: {
    paddingHorizontal: H_PAD,
    gap: 12,
    paddingBottom: 8,
  },
  destCard: {
    width: 140,
    height: 100,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
  },
  destImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  destTitle: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 20,
    paddingHorizontal: H_PAD,
  },
  errorBox: {
    margin: H_PAD,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
    alignItems: "center",
    gap: 6,
  },
  errorText: { color: colors.danger, fontWeight: "600", textAlign: "center", marginTop: 4 },
  errorHint: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 4 },
});
