import React, { useState } from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import AllEventsScreen from "./AllEventsScreen";
import RegisteredEventsScreen from "./RegisteredEventsScreen";
import AppContainer from "~/components/AppContainer";
import { typography, palette } from "~/theme";

const EventsScreen = ({ route }: any) => {
  const layout = useWindowDimensions();
  const activeIndex = route.params?.activeIndex;

  const [index, setIndex] = useState(activeIndex || 0);
  const [routes] = useState([
    { key: "all", title: "All Events" },
    { key: "registered", title: "Registered" },
  ]);

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "all":
        return <AllEventsScreen />;
      case "registered":
        return <RegisteredEventsScreen />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      renderIndicator={() => null}
      style={styles.tabBar}
      renderLabel={({ route, focused }: { route: { key: string; title: string }; focused: boolean }) => (
        <Text
          style={[
            styles.tabBarLabel,
            { color: focused ? palette.primary : palette.grey },
            focused ? typography.fontSemiBold : typography.fontMedium,
          ]}
        >
          {route.title}
        </Text>
      )}
      tabStyle={{
        width: layout.width / 2 - 20,
      }}
      indicatorStyle={{
        backgroundColor: palette.primary,
        height: 2,
      }}
    />
  );

  return (
    <AppContainer gap={20} withScrollView={false}>
      <Text style={[typography.textXl, typography.fontBold, { marginTop: 16 }]}>Events</Text>

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
    shadowOpacity: 0,
    elevation: 0,
  },
  tabBarLabel: {
    ...typography.textBase,
    textAlign: "center",
  },
});

export default EventsScreen;
