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
import MessagesScreen from "~/screens/more/messages/MessagesScreen";
import SingleMessageScreen from "~/screens/more/messages/SingleMessageScreen";
import ProfileScreen from "~/screens/more/profile/ProfileScreen";
import SettingsScreen from "~/screens/more/settings/SettingsScreen";
import NotificationScreen from "~/screens/notifications/NotificationScreen";
import SingleNotificationScreen from "~/screens/home/ notifications/SingleNotificationScreen";
import MembersScreen from "~/screens/home/members/MembersScreen";
import SingleMembersScreen from "~/screens/home/members/SingleMembersScreen";
import SingleEventsScreen from "~/screens/events/SingleEventsScreen";
import VolunteersScreen from "~/screens/home/volunteers/VolunteersScreen";
import SingleVolunteersScreen from "~/screens/home/volunteers/SingleVolunteersScreen";
import FaithEntryScreen from "~/screens/home/faith/FaithEntryScreen";

const HomeStack = createNativeStackNavigator();

export const HomeStackScreens = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleStyle: [typography.textLg, typography.fontBold],
        headerTitle: "",
      }}
    >
      <HomeStack.Screen name="home-index" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="home-notifications"
        component={NotificationScreen}
        options={{ headerTitle: "Notifications" }}
      />
      <HomeStack.Screen name="home-notifications-single" component={SingleNotificationScreen} />
      <HomeStack.Screen
        name="home-members"
        component={MembersScreen}
        options={{ headerTitle: "Connect with Members" }}
      />
      <HomeStack.Screen name="home-members-single" component={SingleMembersScreen} />
      <HomeStack.Screen name="home-messages" component={MessagesScreen} options={{ headerTitle: "Messages" }} />
      <HomeStack.Screen name="home-messages-single" component={SingleMessageScreen} />
      <HomeStack.Screen name="home-events-single" component={SingleEventsScreen} />
      <HomeStack.Screen
        name="home-volunteers"
        component={VolunteersScreen}
        options={{ headerTitle: "Volunteer Opportunities" }}
      />
      <HomeStack.Screen name="home-volunteers-single" component={SingleVolunteersScreen} />
      <HomeStack.Screen name="home-faith" component={FaithEntryScreen} options={{ headerTitle: "Faith Entries" }} />

      <HomeStack.Screen name="home-profile" component={ProfileScreen} options={{ headerTitle: "My Profile" }} />
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
      <EventStack.Screen name="events-single" component={SingleEventsScreen} />
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
      <MoreStack.Screen name="more-profile" component={ProfileScreen} options={{ title: "My Profile" }} />
      <MoreStack.Screen name="more-store" component={StoreScreen} options={{ title: "Store" }} />
      <MoreStack.Screen name="more-settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </MoreStack.Navigator>
  );
};
