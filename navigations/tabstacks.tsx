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
import MembersScreen from "~/screens/home/members/MembersScreen";
import SingleMembersScreen from "~/screens/home/members/SingleMembersScreen";
import SingleEventsScreen from "~/screens/events/SingleEventsScreen";
import VolunteersScreen from "~/screens/home/volunteers/VolunteersScreen";
import SingleVolunteersScreen from "~/screens/home/volunteers/SingleVolunteersScreen";
import FaithEntryScreen from "~/screens/home/faith/FaithEntryScreen";
import ProfileEditScreen from "~/screens/more/profile/ProfileEditScreen";
import SingleResourcesScreen from "~/screens/resources/SingleResourcesScreen";
import StoreSingleProductScreen from "~/screens/more/store/StoreSingleProductScreen";
import StoreCheckoutScreen from "~/screens/more/store/StoreCheckoutScreen";
import StoreCartScreen from "~/screens/more/store/StoreCartScreen";
import StoreOrderHistoryScreen from "~/screens/more/store/StoreOrderHistoryScreen";
import NotificationScreen from "~/screens/home/notifications/NotificationScreen";
import SingleNotificationScreen from "~/screens/home/notifications/SingleNotificationScreen";
import StoreSingleOrderScreen from "~/screens/more/store/StoreSingleOrderScreen";
import PaymentScreen from "~/screens/paystack/PaymentScreen";
import PaymentSuccessScreen from "~/screens/paystack/PaymentSuccessScreen";

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
      <HomeStack.Screen
        name="home-profile-edit"
        component={ProfileEditScreen}
        options={{ headerTitle: "Edit Profile" }}
      />
      <HomeStack.Screen name="home-resources-single" component={SingleResourcesScreen} />
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
      <ResourceStack.Screen name="resources-single" component={SingleResourcesScreen} />
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
        headerTitleStyle: [typography.textLg, typography.fontBold],
        headerTitle: (props) => (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text style={[typography.textXl, typography.fontBold]}>{props.children}</Text>
          </View>
        ),
      }}
    >
      <PaymentStack.Screen name="pay-index" component={PaymentsScreen} options={{ title: "Payments" }} />
      <PaymentStack.Screen name="pay-init" component={PaymentScreen} options={{ headerTitle: "Make Payment" }} />
      <PaymentStack.Screen name="pay-success" component={PaymentSuccessScreen} />
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
      <EventStack.Screen name="events-payment" component={PaymentScreen} options={{ headerTitle: "Make Payment" }} />
      <EventStack.Screen name="events-payment-success" component={PaymentSuccessScreen} />
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
      <MoreStack.Screen name="more-profile-edit" component={ProfileEditScreen} options={{ title: "Edit Profile" }} />
      <MoreStack.Screen name="more-store" component={StoreScreen} options={{ title: "Store" }} />
      <MoreStack.Screen name="more-store-cart" component={StoreCartScreen} options={{ title: "Store Cart" }} />
      <MoreStack.Screen
        name="more-store-checkout"
        component={StoreCheckoutScreen}
        options={{ title: "Store Checkout" }}
      />
      <MoreStack.Screen name="more-store-single" component={StoreSingleProductScreen} options={{ title: "" }} />
      <MoreStack.Screen
        name="more-store-orders"
        component={StoreOrderHistoryScreen}
        options={{ title: "Order History" }}
      />
      <MoreStack.Screen name="more-store-orders-single" component={StoreSingleOrderScreen} options={{ title: "" }} />
      <MoreStack.Screen name="more-store-payment" component={PaymentScreen} options={{ title: "Make Payment" }} />
      <MoreStack.Screen name="more-store-payment-success" component={PaymentSuccessScreen} options={{ title: "" }} />
      <MoreStack.Screen name="more-settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </MoreStack.Navigator>
  );
};
