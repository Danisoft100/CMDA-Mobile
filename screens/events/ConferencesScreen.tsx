import React, { useState } from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import AllConferencesScreen from "./AllConferencesScreen";
import RegisteredEventsScreen from "./RegisteredEventsScreen";
import AppContainer from "~/components/AppContainer";
import { typography, palette } from "~/theme";
import EventSections from "~/components/events/EventSections";

const ConferencesScreen = ({ route }: any) => {
  const layout = useWindowDimensions();
  const activeIndex = route.params?.activeIndex;

  const [index, setIndex] = useState(activeIndex || 0);
  const [routes] = useState([
    { key: "all", title: "All Conferences" },
    { key: "registered", title: "Registered" },
  ]);

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "all":
        return <AllConferencesScreen />;
      case "registered":
        return <RegisteredEventsScreen conferencesOnly />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      activeColor={palette.primary}
      inactiveColor={palette.greyDark}
      options={{
        all: {
          labelStyle: styles.tabBarLabel,
          accessibilityLabel: "All conferences tab",
        },
        registered: {
          labelStyle: styles.tabBarLabel,
          accessibilityLabel: "Registered conferences tab",
        },
      }}
      indicatorStyle={{ backgroundColor: palette.primary, height: 2 }}
      style={styles.tabBar}
      tabStyle={{ minHeight: 48 }}
    />
  );

  return (
    <AppContainer gap={20} withScrollView={false}>
      <Text style={[typography.textXl, typography.fontBold, { marginTop: 16 }]}>
        Conferences
      </Text>
      <EventSections active="conferences" />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "transparent",
    marginHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  tabBarLabel: {
    ...typography.textBase,
    textAlign: "center",
  },
});

export default ConferencesScreen;
