import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { palette } from "../../theme/palette";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import AppContainer from "~/components/AppContainer";
import { typography } from "~/theme";
import SubscriptionScreen from "./SubscriptionScreen";
import DonationScreen from "./DonationScreen";

const PaymentsScreen = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "subscriptions", title: "Subscriptions" },
    { key: "donations", title: "Donations" },
  ]);

  const renderScene = SceneMap({
    subscriptions: SubscriptionScreen,
    donations: DonationScreen,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      renderIndicator={() => null}
      labelStyle={styles.tabBarLabel}
      style={styles.tabBar}
      renderTabBarItem={(iProps: any) => {
        const isActive = iProps.key === routes[iProps.navigationState.index].key;
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
      <Text style={[typography.textXl, typography.fontBold, { marginTop: 16 }]}>Payments</Text>

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

export default PaymentsScreen;
