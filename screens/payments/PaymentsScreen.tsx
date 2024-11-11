import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { palette } from "../../theme/palette";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import AppContainer from "~/components/AppContainer";
import { typography } from "~/theme";
import SubscriptionScreen from "./SubscriptionScreen";
import DonationScreen from "./DonationScreen";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import Button from "~/components/form/Button";
import DonateModal from "~/components/payments/DonateModal";
import { useInitDonationSessionMutation, useInitSubscriptionSessionMutation } from "~/store/api/paymentsApi";

const PaymentsScreen = ({ route, navigation }: any) => {
  const activeIndex = route.params?.activeIndex;
  const layout = useWindowDimensions();

  const { user } = useSelector(selectAuth);

  const [index, setIndex] = useState(activeIndex || 0);
  const [routes] = useState([
    { key: "subscriptions", title: "Subscriptions" },
    { key: "donations", title: "Donations" },
  ]);

  const renderScene = SceneMap({
    subscriptions: SubscriptionScreen,
    donations: DonationScreen,
  });

  const [openDonate, setOpenDonate] = useState(false);

  const [initDonation, { isLoading: isDonating }] = useInitDonationSessionMutation();
  const [initSubscription, { isLoading: isSubscribing }] = useInitSubscriptionSessionMutation();

  const handleInitDonate = (payload: any) => {
    initDonation(payload)
      .unwrap()
      .then((res) => {
        navigation.navigate("pay-init", { paymentFor: "donation", checkoutUrl: res.checkout_url });
      });
  };

  const handleInitSubscribe = () => {
    initSubscription({})
      .unwrap()
      .then((res) => {
        navigation.navigate("pay-init", { paymentFor: "subscription", checkoutUrl: res.checkout_url });
      });
  };

  const handleDonate = () => {
    // setOpenDonate(true);
    fetch("http://192.168.0.197:3000/paypal/create-order", { method: "POST" })
      .then((res) => res.json())
      .then((data) => console.log("DATA", data));
    // .then((data) => setApprovalLink(data.approvalLink));
  };

  const handleSubscribe = () => {
    Alert.alert(
      "Pay Annual Subscription",
      "Would you like to subscribe annually to access premium features and enjoy enhanced benefits?",
      [{ text: "No, Cancel" }, { text: "Yes, Proceed", onPress: handleInitSubscribe }],
      { cancelable: true }
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          icon={!index && user?.subscribed && "check-circle"}
          iconSize={20}
          label={index ? "Donate" : user?.subscribed ? "Subscribed" : "Subscribe"}
          style={{
            backgroundColor: !index && user?.subscribed ? palette.secondary : palette.primary,
            paddingHorizontal: 12,
            minHeight: 40,
          }}
          disabled={!index && user?.subscribed}
          onPress={index ? handleDonate : handleSubscribe}
        />
      ),
    });
  }, [navigation, user?.subscribed, index]);

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
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      {/*  */}
      <DonateModal
        visible={openDonate}
        onClose={() => setOpenDonate(false)}
        onSubmit={(data: any) => {
          handleInitDonate(data);
          setOpenDonate(false);
        }}
        loading={isDonating}
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
