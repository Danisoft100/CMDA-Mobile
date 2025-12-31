import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { getTabBarHeight } from "~/utils/safeAreaUtils";
import { palette, typography } from "~/theme";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EventStackScreens,
  HomeStackScreens,
  MoreStackScreens,
  PaymentStackScreens,
  ResourceStackScreens,
} from "./tabstacks";

const Tab = createBottomTabNavigator();

const TabNavigations = () => {
  const insets = useSafeAreaInsets();
  
  const TABSCREENS = [
    { name: "home", icon: "home", screen: HomeStackScreens },
    { name: "events", icon: "calendar", screen: EventStackScreens },
    { name: "resources", icon: "youtube", screen: ResourceStackScreens },
    { name: "payment", icon: "credit-card", screen: PaymentStackScreens },
    { name: "more", icon: "menu", screen: MoreStackScreens },
  ];

  const totalTabBarHeight = getTabBarHeight(insets);

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        unmountOnBlur: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: palette.primary,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: totalTabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: Platform.OS === "android" ? 8 : 4,
        },
        tabBarHideOnKeyboard: false,
      }}
    >
      {TABSCREENS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.screen}
          options={{
            title: capitalizeWords(tab.name),
            tabBarIcon: (props) => <MCIcon {...props} size={32} name={tab.icon as any} />,
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
