import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { palette, typography } from "~/theme";
import { HomeStackScreens, PayStackScreens, ProfileStackScreens, RewardStackScreens } from "./tabstacks";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

const TabNavigations = () => {
  const TABSCREENS = [
    { name: "home", icon: "home", screen: HomeStackScreens },
    { name: "rewards", icon: "trophy", screen: RewardStackScreens },
    { name: "pay", icon: "credit-card", screen: PayStackScreens },
    { name: "profile", icon: "account", screen: ProfileStackScreens },
  ];

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {TABSCREENS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.screen}
          options={{
            title: capitalizeWords(tab.name),
            tabBarIcon: (props) => <MCIcon {...props} size={32} name={tab.icon as any} />,
            tabBarStyle: [{ backgroundColor: palette.grey }, Platform.OS === "android" && { height: 64 }],
            tabBarInactiveTintColor: palette.black,
            tabBarActiveTintColor: palette.primary,
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
