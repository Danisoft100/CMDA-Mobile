import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { palette, typography } from "~/theme";
import HomeScreen from "~/screens/home/HomeScreen";
import RewardsScreen from "~/screens/rewards/RewardsScreen";
import PayScreen from "~/screens/pay/PayScreen";
import ProfileScreen from "~/screens/profile/ProfileScreen";
import SettingsScreen from "~/screens/profile/SettingsScreen";

const HomeStack = createNativeStackNavigator();

export const HomeStackScreens = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <HomeStack.Screen name="home-index" component={HomeScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
};

const RewardStack = createNativeStackNavigator();

export const RewardStackScreens = () => {
  return (
    <RewardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <RewardStack.Screen name="rewards-index" component={RewardsScreen} options={{ headerShown: false }} />
    </RewardStack.Navigator>
  );
};

const PayStack = createNativeStackNavigator();

export const PayStackScreens = () => {
  return (
    <PayStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <PayStack.Screen name="pay-index" component={PayScreen} options={{ headerShown: false }} />
    </PayStack.Navigator>
  );
};

const ProfileStack = createNativeStackNavigator();

export const ProfileStackScreens = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <ProfileStack.Screen name="profile-index" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="profile-settings" component={SettingsScreen} options={{ headerTitle: "Settings" }} />
    </ProfileStack.Navigator>
  );
};
