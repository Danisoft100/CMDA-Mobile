import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { palette } from "../../theme/palette";
import { TabBar, TabView } from "react-native-tab-view";
import AppContainer from "~/components/AppContainer";
import { typography } from "~/theme";
import SubscriptionScreen from "./SubscriptionScreen";
import DonationScreen from "./DonationScreen";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import Button from "~/components/form/Button";
import { useInitSubscriptionSessionMutation } from "~/store/api/paymentsApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoles } from "~/utils/useRoles";
import { PaymentIntents } from "~/components/payments";
import GlobalSubscriptionModal from "~/components/payments/GlobalSubscriptionModal";
import NigerianLifetimeModal from "~/components/payments/NigerianLifetimeModal";

const PaymentsScreen = ({ route, navigation }: any) => {
  const activeIndex = route.params?.activeIndex;
  const layout = useWindowDimensions();

  const { user } = useSelector(selectAuth);
  const { isGlobalNetwork } = useRoles();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  const [index, setIndex] = useState(activeIndex || 0);
  const [routes] = useState([
    { key: "subscriptions", title: "Subscriptions" },
    { key: "donations", title: "Donations" },
  ]);

  const handleViewAllTransactions = () => {
    navigation.navigate("pay-transactions");
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "subscriptions":
        return (
          <View style={{ flex: 1 }}>
            <PaymentIntents compact showTitle={false} onViewAll={handleViewAllTransactions} />
            <SubscriptionScreen />
          </View>
        );
      case "donations":
        return (
          <View style={{ flex: 1 }}>
            <PaymentIntents compact showTitle={false} onViewAll={handleViewAllTransactions} />
            <DonationScreen />
          </View>
        );
      default:
        return null;
    }
  };

  const [initSubscription, { isLoading: isSubscribing }] = useInitSubscriptionSessionMutation();

  const handleInitSubscribe = () => {
    initSubscription({})
      .unwrap()
      .then((data) => {
        if (data.checkout_url) {
          navigation.navigate("pay-init", { paymentFor: "subscription", checkoutUrl: data.checkout_url });
        } else {
          const approvalUrl = data.links.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
          navigation.navigate("pay-init", { paymentFor: "subscription", checkoutUrl: approvalUrl, source: "PAYPAL" });
        }
      });
  };

  const handleDonate = () => {
    navigation.navigate("pay-make-donation");
  };
  const handleSubscribe = () => {
    if (isGlobalNetwork) {
      setShowSubscriptionModal(true);
      return;
    }

    Alert.alert(
      "Pay Annual Subscription",
      "Would you like to subscribe annually to access premium features and enjoy enhanced benefits?",
      [{ text: "No, Cancel" }, { text: "Yes, Proceed", onPress: handleInitSubscribe }],
      { cancelable: true }
    );
  };

  const inset = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            gap: 8,
            marginTop: 8,
            paddingTop: inset.top,
            paddingHorizontal: 12,
            backgroundColor: palette.background,
            alignItems: 'center'
          }}
        >
          <Text style={[typography.textLg, typography.fontSemiBold, { flex: 1 }]}>Payment</Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!index && !isGlobalNetwork && !user?.subscribed && (
              <Button
                label="Lifetime"
                dense
                variant="outlined"
                style={{
                  minHeight: 36,
                  paddingHorizontal: 12,
                }}
                onPress={() => setShowLifetimeModal(true)}
              />
            )}

            <Button
              icon={!index && user?.subscribed && "check-circle"}
              iconSize={16}
              label={index ? "Donate" : user?.subscribed ? "Subscribed" : "Subscribe"}
              dense
              style={{
                backgroundColor: !index && user?.subscribed ? palette.secondary : palette.primary,
                paddingHorizontal: 12,
                minHeight: 36,
              }}
              loading={isSubscribing}
              disabled={!index && user?.subscribed}
              onPress={index ? handleDonate : handleSubscribe}
            />
          </View>
        </View>
      ),
    });
  }, [navigation, user?.subscribed, index, isSubscribing, isGlobalNetwork]);

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
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      <GlobalSubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        navigation={navigation}
      />
      <NigerianLifetimeModal
        visible={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
        navigation={navigation}
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
