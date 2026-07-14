import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { BASE_URL } from "../api/client";
import { GuideProfile, User } from "../types";
import { RootStackParamList } from "./types";

const guideProfileKey = (userId: number) => `detour_guide_profile_${userId}`;

async function handleGuideProfiles(res: Response): Promise<GuideProfile[]> {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || "Request failed";
    throw new Error(message);
  }
  return data as GuideProfile[];
}

async function fetchGuideProfileByUserId(userId: number): Promise<GuideProfile | null> {
  // No GET /api/guides/{id} or by-user endpoint yet — filter pending list client-side.
  const pending = await fetch(`${BASE_URL}/api/guides/pending`).then(handleGuideProfiles);
  return pending.find((p) => p.userId === userId) ?? null;
}

export async function cacheGuideProfile(profile: GuideProfile): Promise<void> {
  await AsyncStorage.setItem(guideProfileKey(profile.userId), JSON.stringify(profile));
}

export async function loadCachedGuideProfile(userId: number): Promise<GuideProfile | null> {
  const raw = await AsyncStorage.getItem(guideProfileKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuideProfile;
  } catch {
    return null;
  }
}

export async function resolveGuideProfile(userId: number): Promise<GuideProfile | null> {
  const cached = await loadCachedGuideProfile(userId);
  if (cached) return cached;

  const fromPending = await fetchGuideProfileByUserId(userId);
  if (fromPending) {
    await cacheGuideProfile(fromPending);
    return fromPending;
  }

  return null;
}

export function routeAfterAuth(
  navigation: NavigationProp<RootStackParamList>,
  user: User,
  profile: GuideProfile | null
): void {
  if (user.role !== "GUIDE") {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    return;
  }

  if (!profile || profile.verificationStatus === "PENDING" || profile.verificationStatus === "REJECTED") {
    navigation.reset({ index: 0, routes: [{ name: "GuideOnboarding" }] });
    return;
  }

  navigation.reset({ index: 0, routes: [{ name: "GuideTabs" }] });
}

export async function navigateAfterAuth(
  navigation: NavigationProp<RootStackParamList>,
  user: User
): Promise<void> {
  if (user.role !== "GUIDE") {
    routeAfterAuth(navigation, user, null);
    return;
  }

  const profile = await resolveGuideProfile(user.id);
  routeAfterAuth(navigation, user, profile);
}
