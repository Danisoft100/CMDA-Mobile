import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { palette } from "~/theme";

const PaymentScreen = ({ route, navigation }: any) => {
  const { checkoutUrl, paymentFor } = route.params;

  const onNavigationStateChange = (state: any) => {
    const { url } = state;

    if (!url) return;

    // if (url === callback_url) {
    if (url.includes("success")) {
      // Parse the URL
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);
      // Get 'trxref' and 'reference' from URL parameters
      const reference = params.get("reference");

      // navigate to success screen
      if (paymentFor === "order") {
        navigation.navigate("more-store-payment-success", { reference, paymentFor });
      } else {
        navigation.navigate("pay-success", { reference, paymentFor });
      }
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ marginTop: 4 }}
        onNavigationStateChange={onNavigationStateChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 8,
    backgroundColor: palette.background,
  },
});

export default PaymentScreen;
