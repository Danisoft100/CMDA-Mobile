import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { palette, typography } from "~/theme";
import HomeScreen from "~/screens/home/HomeScreen";
import ProfileScreen from "~/screens/profile/ProfileScreen";
import SettingsScreen from "~/screens/profile/SettingsScreen";
import ResourcesScreen from "~/screens/resources/ResourcesScreen";
import EventsScreen from "~/screens/events/EventsScreen";
import PaymentsScreen from "~/screens/payments/PaymentsScreen";

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

const ResourceStack = createNativeStackNavigator();

export const ResourceStackScreens = () => {
  return (
    <ResourceStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <ResourceStack.Screen name="resources-index" component={ResourcesScreen} options={{ headerShown: false }} />
    </ResourceStack.Navigator>
  );
};

const PaymentStack = createNativeStackNavigator();

export const PaymentStackScreens = () => {
  return (
    <PaymentStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <PaymentStack.Screen name="pay-index" component={PaymentsScreen} options={{ headerShown: false }} />
    </PaymentStack.Navigator>
  );
};

const EventStack = createNativeStackNavigator();

export const EventStackScreens = () => {
  return (
    <EventStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: "",
      }}
    >
      <EventStack.Screen name="events-index" component={EventsScreen} options={{ headerShown: false }} />
    </EventStack.Navigator>
  );
};
