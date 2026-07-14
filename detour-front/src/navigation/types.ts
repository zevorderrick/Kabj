import { NavigatorScreenParams } from "@react-navigation/native";
import { Attraction, GuideBookingDetailParams } from "../types";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  GuideOnboarding: undefined;
  GuideTabs: NavigatorScreenParams<GuideTabsParamList> | undefined;
  GuideBookingDetail: GuideBookingDetailParams;
  AttractionDetail: { attraction: Attraction };
  BookTour: { attraction: Attraction };
  Payment: { paymentId: number; attractionTitle: string };
  EmergencyContacts: undefined;
  SOSRecording: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Explore: undefined;
  FacilitiesMap: undefined;
  Safety: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type GuideTabsParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Payouts: undefined;
  Profile: undefined;
};
