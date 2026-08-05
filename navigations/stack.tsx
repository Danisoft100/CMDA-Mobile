import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppFontsTest from "~/screens/AppFontsTest";
import OnboardingScreen from "~/screens/onboarding/OnboardingScreen";
import SplashScreen from "~/screens/splash/SplashScreen";
import SignInScreen from "~/screens/auth/SignInScreen";
import SignUpScreen from "~/screens/auth/SignUpScreen";
import VerifyAccountScreen from "~/screens/auth/VerifyAccountScreen";
import PINEntryScreen from "~/screens/auth/PINEntryScreen";
import { palette, typography } from "~/theme";
import TabNavigations from "./tabs";
import ForgotPassword from "~/screens/auth/ForgotPassword";
import ResetPasswordScreen from "~/screens/auth/ResetPassword";
import SignUp2Screen from "~/screens/auth/SignUp2Screen";
import PublicConferencesScreen from "~/screens/events/PublicConferencesScreen";
import SecuritySettingsScreen from "~/screens/more/settings/SecuritySettingsScreen";
import SingleMessageScreen from "~/screens/more/messages/SingleMessageScreen";

const Stack = createNativeStackNavigator();

function StackNavigation() {
  return (
    <Stack.Navigator initialRouteName="splash">
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" component={SplashScreen} />
        <Stack.Screen name="onboarding" component={OnboardingScreen} />
        <Stack.Screen name="sign-in" component={SignInScreen} />
        {__DEV__ ? <Stack.Screen name="security-preview" component={SecuritySettingsScreen} /> : null}
        <Stack.Screen name="tab" component={TabNavigations} />
        <Stack.Screen
          name="home-messages-single"
          component={SingleMessageScreen}
          options={{ headerShown: true }}
        />
        {/* Test */}
        <Stack.Screen name="appfont" component={AppFontsTest} />
        {/*  */}
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerTitleStyle: [typography.textXl, typography.fontBold],
          headerTitle: "",
        }}
      >
        <Stack.Screen name="sign-up" component={SignUpScreen} options={{ headerTitle: "Get Started" }} />
        <Stack.Screen name="sign-up-2" component={SignUp2Screen} />
        <Stack.Screen name="verify" component={VerifyAccountScreen} options={{ headerTitle: "Email Verification" }} />
        <Stack.Screen name="forgot-password" component={ForgotPassword} options={{ headerTitle: "Forgot Password" }} />
        <Stack.Screen
          name="reset-password"
          component={ResetPasswordScreen}
          options={{ headerTitle: "Reset Password" }}
        />
        <Stack.Screen 
          name="pin-entry" 
          component={PINEntryScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="public-conferences" component={PublicConferencesScreen} options={{ headerTitle: "Conferences" }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default StackNavigation;
