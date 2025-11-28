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
import { navigationRef } from "~/utils/navigationService";

SplashScreen.preventAutoHideAsync();

export default function AppNavigation() {
  const [fontsLoaded, fontError] = useFonts({
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  React.useEffect(() => {
    if (fontError) {
      console.error('[Navigation] Font loading error:', fontError);
    }
    if (fontsLoaded) {
      console.log('[Navigation] Fonts loaded successfully');
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const onLayoutRootView = async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
        console.log('[Navigation] Splash screen hidden');
      } catch (error) {
        console.error('[Navigation] Error hiding splash screen:', error);
      }
    }
  };

  return (
    <NavigationContainer onReady={onLayoutRootView} ref={navigationRef}>
      <StackNavigation />
    </NavigationContainer>
  );
}
