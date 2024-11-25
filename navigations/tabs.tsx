import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { palette, typography } from "~/theme";
import { Platform, SafeAreaView, Text } from "react-native";
import {
  EventStackScreens,
  HomeStackScreens,
  MoreStackScreens,
  PaymentStackScreens,
  ResourceStackScreens,
} from "./tabstacks";

const Tab = createBottomTabNavigator();

const TabNavigations = () => {
  const TABSCREENS = [
    { name: "home", icon: "home", screen: HomeStackScreens },
    { name: "events", icon: "calendar", screen: EventStackScreens },
    { name: "resources", icon: "youtube", screen: ResourceStackScreens },
    { name: "payment", icon: "credit-card", screen: PaymentStackScreens },
    { name: "more", icon: "menu", screen: MoreStackScreens },
  ];

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, unmountOnBlur: true }}>
      {TABSCREENS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.screen}
          options={{
            title: capitalizeWords(tab.name),
            tabBarIcon: (props) => <MCIcon {...props} size={32} name={tab.icon as any} />,
            tabBarStyle: [{ backgroundColor: palette.primary }, Platform.OS === "android" && { height: 64 }],
            tabBarInactiveTintColor: palette.onPrimaryContainer,
            tabBarActiveTintColor: palette.primary,
            tabBarActiveBackgroundColor: palette.onPrimary,
            tabBarLabelStyle: [
              typography.textXs,
              typography.fontSemiBold,
              Platform.OS === "android" && { marginTop: -4, paddingBottom: 8 },
            ],
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNavigations;
