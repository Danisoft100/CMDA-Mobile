import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import * as SplashScreen from "expo-splash-screen";
import StackNavigation from "./stack";

SplashScreen.preventAutoHideAsync();

export default function AppNavigation() {
  const [fontsLoaded, fontError] = useFonts({
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const onLayoutRootView = async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  };

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StackNavigation />
    </NavigationContainer>
  );
}
