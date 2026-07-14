import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../api/client";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";
import { cacheGuideProfile, resolveGuideProfile } from "../../navigation/guideRouting";
import { RootStackParamList } from "../../navigation/types";
import { colors, radius } from "../../theme";
import { GuideProfile, VerificationStatus } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "GuideOnboarding">;

function StatusBanner({ status }: { status: VerificationStatus }) {
  const config =
    status === "PENDING"
      ? { icon: "time-outline" as const, title: "Pending Review", color: colors.warning, bg: "#fef3c7" }
      : { icon: "close-circle-outline" as const, title: "Application Rejected", color: colors.danger, bg: "#fef2f2" };

  return (
    <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={28} color={config.color} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
        <Text style={styles.statusBody}>
          {status === "PENDING"
            ? "Your guide application is under review. We'll notify you once verified."
            : "Your application was not approved. Contact support if you believe this is an error."}
        </Text>
      </View>
    </View>
  );
}

export default function GuideOnboardingScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [existingProfile, setExistingProfile] = useState<GuideProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [languages, setLanguages] = useState("");
  const [gtaLicenseNo, setGtaLicenseNo] = useState("");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }
      try {
        const profile = await resolveGuideProfile(user.id);
        if (profile) {
          setExistingProfile(profile);
          if (profile.verificationStatus === "APPROVED") {
            navigation.reset({ index: 0, routes: [{ name: "GuideTabs" }] });
            return;
          }
          if (profile.verificationStatus === "PENDING" || profile.verificationStatus === "REJECTED") {
            setSubmitted(true);
          }
        }
      } finally {
        setCheckingProfile(false);
      }
    })();
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!bio || !specialty || !languages || !gtaLicenseNo || !ghanaCardNumber) {
      Alert.alert("Missing info", "All fields are required.");
      return;
    }

    if (!companyName.trim()) {
      setCompanyError("Company name is required — we must verify your tour operator employer.");
      return;
    }
    setCompanyError(null);

    setLoading(true);
    try {
      const profile = await api.onboardGuide({
        userId: user.id,
        bio,
        specialty,
        languages,
        gtaLicenseNo,
        ghanaCardNumber,
        companyName: companyName.trim(),
      });
      await cacheGuideProfile(profile);
      setExistingProfile(profile);
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert("Submission failed", e.message || "Could not submit your application.");
    } finally {
      setLoading(false);
    }
  };

  const showForm = !submitted && !existingProfile;
  const status = existingProfile?.verificationStatus;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Guide onboarding</Text>
        <Text style={styles.subtitle}>
          Complete your profile so we can verify your GTA license and employer.
        </Text>

        {checkingProfile ? (
          <Text style={styles.muted}>Checking your application status…</Text>
        ) : null}

        {submitted && status ? <StatusBanner status={status} /> : null}

        {showForm ? (
          <>
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell tourists about your experience"
              multiline
            />
            <Input
              label="Specialty"
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="e.g. Historical tours, Eco tours"
            />
            <Input
              label="Languages"
              value={languages}
              onChangeText={setLanguages}
              placeholder="English, Twi, Ga"
            />
            <Input
              label="GTA license number"
              value={gtaLicenseNo}
              onChangeText={setGtaLicenseNo}
              placeholder="GTA-12345"
            />
            <Input
              label="Ghana card number"
              value={ghanaCardNumber}
              onChangeText={setGhanaCardNumber}
              placeholder="GHA-000000000-0"
            />
            <Input
              label="Company name (required)"
              value={companyName}
              onChangeText={(text) => {
                setCompanyName(text);
                if (text.trim()) setCompanyError(null);
              }}
              placeholder="Tour operator you work for"
            />
            {companyError ? <Text style={styles.errorText}>{companyError}</Text> : null}

            <Button title="Submit for Review" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 60, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  muted: { color: colors.textMuted, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: -8, marginBottom: 8 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  statusTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  statusBody: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
