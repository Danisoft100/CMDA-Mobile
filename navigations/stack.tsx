import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppFontsTest from "~/screens/AppFontsTest";
import OnboardingScreen from "~/screens/onboarding/OnboardingScreen";
import SplashScreen from "~/screens/splash/SplashScreen";
import SignInScreen from "~/screens/auth/SignInScreen";
import SignUpScreen from "~/screens/auth/SignUpScreen";
import VerifyAccountScreen from "~/screens/auth/VerifyAccountScreen";
import { palette, typography } from "~/theme";
// import TabNavigations from "./tabs";
import ForgotPassword from "~/screens/auth/ForgotPassword";
import ResetPasswordScreen from "~/screens/auth/ResetPassword";
import SignUp2Screen from "~/screens/auth/SignUp2Screen";

const Stack = createNativeStackNavigator();

function StackNavigation() {
  return (
    <Stack.Navigator initialRouteName="">
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" component={SplashScreen} />
        <Stack.Screen name="onboarding" component={OnboardingScreen} />
        {/* <Stack.Screen name="tab" component={TabNavigations} /> */}
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
        <Stack.Screen name="sign-in" component={SignInScreen} options={{ headerTitle: "Sign In" }} />
        <Stack.Screen name="sign-up" component={SignUpScreen} options={{ headerTitle: "Get Started" }} />
        <Stack.Screen name="sign-up-2" component={SignUp2Screen} />
        <Stack.Screen name="verify" component={VerifyAccountScreen} options={{ headerTitle: "Email Verification" }} />
        <Stack.Screen name="forgot-password" component={ForgotPassword} options={{ headerTitle: "Forgot Password" }} />
        <Stack.Screen
          name="reset-password"
          component={ResetPasswordScreen}
          options={{ headerTitle: "Reset Password" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default StackNavigation;
