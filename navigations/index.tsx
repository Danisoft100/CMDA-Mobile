import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
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

// Prevent double initialization
let splashPreventCalled = false;
if (!splashPreventCalled) {
  SplashScreen.preventAutoHideAsync().catch(() => {
    console.log('[Navigation] Splash already hidden or prevented');
  });
  splashPreventCalled = true;
}

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
      // Continue anyway - app will use system fonts
    }
    if (fontsLoaded) {
      console.log('[Navigation] Fonts loaded successfully');
    }
  }, [fontsLoaded, fontError]);

  // Always render to prevent blocking - don't wait for fonts to load
  const onLayoutRootView = React.useCallback(async () => {
    try {
      // Add a small delay for initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      await SplashScreen.hideAsync();
      console.log('[Navigation] Splash screen hidden');
    } catch (error) {
      console.error('[Navigation] Error hiding splash screen:', error);
      // Continue anyway
    }
  }, []);

  // Render immediately with fallback UI
  if (fontError) {
    console.warn('[Navigation] Using system fonts due to font loading error');
  }

  return (
    <NavigationContainer 
      onReady={onLayoutRootView} 
      ref={navigationRef}
      fallback={
        <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      }
    >
      <StackNavigation />
    </NavigationContainer>
  );
}
