import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { GuideTabsParamList } from "./types";
import GuideDashboardScreen from "../screens/guide/GuideDashboardScreen";
import GuideCalendarScreen from "../screens/guide/GuideCalendarScreen";
import GuidePayoutsScreen from "../screens/guide/GuidePayoutsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator<GuideTabsParamList>();

const ICONS: Record<keyof GuideTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "grid",
  Calendar: "calendar",
  Payouts: "wallet",
  Profile: "person",
};

export default function GuideTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : (`${ICONS[route.name]}-outline` as any)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={GuideDashboardScreen} />
      <Tab.Screen name="Calendar" component={GuideCalendarScreen} />
      <Tab.Screen name="Payouts" component={GuidePayoutsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
