import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { RootStackParamList } from "./types";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AttractionDetailScreen from "../screens/AttractionDetailScreen";
import BookTourScreen from "../screens/BookTourScreen";
import PaymentScreen from "../screens/PaymentScreen";
import EmergencyContactsScreen from "../screens/EmergencyContactsScreen";
import SOSRecordingScreen from "../screens/SOSRecordingScreen";
import MainTabs from "./MainTabs";
import GuideTabs from "./GuideTabs";
import GuideOnboardingScreen from "../screens/guide/GuideOnboardingScreen";
import GuideBookingDetailScreen from "../screens/guide/GuideBookingDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GuideOnboarding" component={GuideOnboardingScreen} />
      <Stack.Screen name="GuideTabs" component={GuideTabs} />
      <Stack.Screen name="GuideBookingDetail" component={GuideBookingDetailScreen} />
      <Stack.Screen name="AttractionDetail" component={AttractionDetailScreen} />
      <Stack.Screen name="BookTour" component={BookTourScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="SOSRecording" component={SOSRecordingScreen} />
    </Stack.Navigator>
  );
}
