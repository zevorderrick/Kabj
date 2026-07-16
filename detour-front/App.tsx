import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HeadsUpNotificationHost from "./src/components/HeadsUpNotificationHost";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
          {/* Rendered above the navigator so heads-up banners can appear over any screen. */}
          <HeadsUpNotificationHost />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
