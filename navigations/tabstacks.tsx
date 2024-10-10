import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { palette, typography } from "~/theme";
import HomeScreen from "~/screens/home/HomeScreen";
import ResourcesScreen from "~/screens/resources/ResourcesScreen";
import EventsScreen from "~/screens/events/EventsScreen";
import PaymentsScreen from "~/screens/payments/PaymentsScreen";
import MoreOptionScreen from "~/screens/more/MoreOptionScreen";
import StoreScreen from "~/screens/more/store/StoreScreen";
import { Text, View } from "react-native";

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

const MoreStack = createNativeStackNavigator();

export const MoreStackScreens = () => {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textXl, typography.fontBold],
        headerTitle: (props) => (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text style={[typography.textXl, typography.fontBold]}>{props.children}</Text>
          </View>
        ),
      }}
    >
      <MoreStack.Screen name="more-index" component={MoreOptionScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="more-profile" component={MoreOptionScreen} options={{ title: "Profile" }} />
      <MoreStack.Screen name="more-settings" component={MoreOptionScreen} />
      <MoreStack.Screen name="more-store" component={StoreScreen} options={{ title: "Store" }} />
    </MoreStack.Navigator>
  );
};
