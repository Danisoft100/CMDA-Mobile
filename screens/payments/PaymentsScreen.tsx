import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
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
import { getPayPalApprovalUrl } from "~/utils/paypal";
import ZellePayments from "~/components/payments/ZellePayments";
import { useGetSubscriptionStatusQuery } from "~/store/api/paymentsApi";

const PaymentsScreen = ({ route, navigation }: any) => {
  const activeIndex = route.params?.activeIndex;
  const layout = useWindowDimensions();
  const stackHeader = layout.width < 400 || layout.fontScale > 1.2;

  const { user } = useSelector(selectAuth);
  const { isGlobalNetwork } = useRoles();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showZelle, setShowZelle] = useState(false);
  const { data: subscriptionStatus } = useGetSubscriptionStatusQuery(
    {},
    { skip: !isGlobalNetwork },
  );
  const subscriptionComplete =
    isGlobalNetwork && !user?.hasLifetimeMembership
      ? subscriptionStatus?.isFullyPaid
      : user?.subscribed;

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
            <PaymentIntents
              compact
              showTitle={false}
              onViewAll={handleViewAllTransactions}
            />
            <SubscriptionScreen />
          </View>
        );
      case "donations":
        return (
          <View style={{ flex: 1 }}>
            <PaymentIntents
              compact
              showTitle={false}
              onViewAll={handleViewAllTransactions}
            />
            <DonationScreen />
          </View>
        );
      default:
        return null;
    }
  };

  const [initSubscription, { isLoading: isSubscribing }] =
    useInitSubscriptionSessionMutation();

  const handleInitSubscribe = () => {
    initSubscription({})
      .unwrap()
      .then((data) => {
        if (data.checkout_url) {
          navigation.navigate("pay-init", {
            paymentFor: "subscription",
            checkoutUrl: data.checkout_url,
          });
        } else {
          const approvalUrl = getPayPalApprovalUrl(data);
          navigation.navigate("pay-init", {
            paymentFor: "subscription",
            checkoutUrl: approvalUrl,
            source: "PAYPAL",
          });
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
      [
        { text: "No, Cancel" },
        { text: "Yes, Proceed", onPress: handleInitSubscribe },
      ],
      { cancelable: true },
    );
  };

  const inset = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: stackHeader ? "column" : "row",
            gap: 8,
            marginTop: 8,
            paddingTop: inset.top,
            paddingHorizontal: 12,
            backgroundColor: palette.background,
            alignItems: stackHeader ? "stretch" : "center",
          }}
        >
          <Text
            style={[
              typography.textLg,
              typography.fontSemiBold,
              { flex: stackHeader ? 0 : 1 },
            ]}
          >
            Payment
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {!index && !isGlobalNetwork && !user?.subscribed && (
              <Button
                label="Lifetime"
                dense
                variant="outlined"
                style={{
                  minHeight: 44,
                  flexGrow: stackHeader ? 1 : 0,
                  paddingHorizontal: 12,
                }}
                onPress={() => setShowLifetimeModal(true)}
              />
            )}

            <Button
              icon={!index && subscriptionComplete && "check-circle"}
              iconSize={16}
              label={
                index
                  ? "Donate"
                  : subscriptionComplete
                    ? "Year fully paid"
                    : "Make a payment"
              }
              dense
              style={{
                backgroundColor:
                  !index && user?.subscribed
                    ? palette.secondary
                    : palette.primary,
                paddingHorizontal: 12,
                minHeight: 44,
                flexGrow: stackHeader ? 1 : 0,
              }}
              loading={isSubscribing}
              disabled={!index && subscriptionComplete}
              onPress={index ? handleDonate : handleSubscribe}
            />
          </View>
        </View>
      ),
    });
  }, [
    navigation,
    user?.subscribed,
    subscriptionComplete,
    index,
    isSubscribing,
    isGlobalNetwork,
    stackHeader,
    inset.top,
  ]);

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
      {isGlobalNetwork && (
        <Button
          label="Zelle transfers / upload receipt"
          variant="outlined"
          onPress={() => setShowZelle(true)}
        />
      )}
      <ZellePayments visible={showZelle} onClose={() => setShowZelle(false)} />
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
