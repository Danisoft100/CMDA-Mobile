import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { useGetPaypalOrderDetailsMutation } from "~/store/api/paymentsApi";
import { palette } from "~/theme";

const PaymentScreen = ({ route, navigation }: any) => {
  const { checkoutUrl, paymentFor } = route.params || {};
  const [getOrderDetails] = useGetPaypalOrderDetailsMutation();

  const fetchApprovalStatus = (reference: string) => {
    getOrderDetails(reference)
      .unwrap()
      .then((data) => {
        if (data.status === "APPROVED") {
          if (paymentFor === "order") {
            navigation.navigate("more-store-payment-success", { reference, paymentFor, source: "PAYPAL" });
          } else if (paymentFor === "event") {
            navigation.navigate("events-payment-success", { reference, paymentFor, source: "PAYPAL" });
          } else {
            navigation.navigate("pay-success", { reference, paymentFor, source: "PAYPAL" });
          }
        }
      });
  };

  const onNavigationStateChange = async (state: any) => {
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
      } else if (paymentFor === "event") {
        navigation.navigate("events-payment-success", { reference, paymentFor });
      } else {
        navigation.navigate("pay-success", { reference, paymentFor });
      }
    }
    //
    if (url.includes("paypal")) {
      if (url.includes("token")) {
        const reference = new URL(url).searchParams.get("token");
        fetchApprovalStatus(reference as string);
      }
      if (url.includes("cancelLink")) {
        const reference = new URL(checkoutUrl).searchParams.get("token");
        if (paymentFor === "order") {
          navigation.navigate("more-store-payment-success", { reference, paymentFor, source: "PAYPAL" });
        } else if (paymentFor === "event") {
          navigation.navigate("events-payment-success", { reference, paymentFor, source: "PAYPAL" });
        } else {
          navigation.navigate("pay-success", { reference, paymentFor, source: "PAYPAL" });
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ marginTop: 4 }}
        onNavigationStateChange={onNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled
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
