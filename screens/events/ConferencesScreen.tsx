import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import AllConferencesScreen from "./AllConferencesScreen";
import RegisteredEventsScreen from "./RegisteredEventsScreen";
import AppContainer from "~/components/AppContainer";
import { typography, palette } from "~/theme";

const ConferencesScreen = ({ route }: any) => {
  const layout = useWindowDimensions();
  const activeIndex = route.params?.activeIndex;

  const [index, setIndex] = useState(activeIndex || 0);
  const [routes] = useState([
    { key: "all", title: "All Conferences" },
    { key: "registered", title: "Registered" },
  ]);

  const renderScene = SceneMap({
    all: AllConferencesScreen,
    registered: RegisteredEventsScreen,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      renderIndicator={() => null}
      labelStyle={styles.tabBarLabel}
      style={styles.tabBar}
      renderTabBarItem={({ key, ...iProps }: any) => {
        const isActive = key === routes[iProps.navigationState.index].key;
        return (
          <TouchableOpacity
            {...iProps}
            style={{
              width: layout.width / 2 - 20,
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: isActive ? 2 : 0,
              borderBottomColor: palette.primary,
            }}
          >
            <Text
              style={[
                iProps.labelStyle,
                { color: isActive ? palette.primary : palette.grey },
                isActive ? typography.fontSemiBold : typography.fontMedium,
              ]}
            >
              {iProps.route.title}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  return (
    <AppContainer gap={20} withScrollView={false}>
      <Text style={[typography.textXl, typography.fontBold, { marginTop: 16 }]}>Conferences</Text>

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
