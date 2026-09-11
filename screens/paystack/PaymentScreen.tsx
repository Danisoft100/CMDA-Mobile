import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useGetPaypalOrderDetailsMutation } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";

const TRUSTED_PAYMENT_DOMAINS = [
  "paystack.com",
  "paystack.co",
  "paypal.com",
  "paypalobjects.com",
  "cmdanigeria.org",
  "cmdabackend-38258a63fa98.herokuapp.com",
];

const isTrustedPaymentUrl = (value: string) => {
  if (value === "about:blank") return true;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && !(__DEV__ && parsed.protocol === "http:")) return false;
    const hostname = parsed.hostname.toLowerCase();
    if (__DEV__ && ["localhost", "127.0.0.1"].includes(hostname)) return true;
    return TRUSTED_PAYMENT_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

const PaymentScreen = ({ route, navigation }: any) => {
  const { checkoutUrl, paymentFor, source } = route.params || {};
  const [getOrderDetails] = useGetPaypalOrderDetailsMutation();
  const [error, setError] = useState<string | null>(null);
  const handledReference = useRef<string | null>(null);

  const navigateToSuccess = useCallback(
    (reference: string, source = "paystack") => {
      if (handledReference.current === reference) return;
      handledReference.current = reference;

      const params = { reference, paymentFor, source: source.toLowerCase() };
      if (paymentFor === "order") {
        navigation.replace("more-store-payment-success", params);
      } else if (paymentFor === "event" || paymentFor === "conference") {
        navigation.replace("events-payment-success", params);
      } else {
        navigation.replace("pay-success", params);
      }
    },
    [navigation, paymentFor]
  );

  const handleCancellation = useCallback(() => {
    Toast.show({ type: "info", text1: "Payment cancelled", text2: "No charge was recorded." });
    navigation.goBack();
  }, [navigation]);

  const fetchApprovalStatus = useCallback(
    async (reference: string) => {
      if (!reference || handledReference.current === reference) return;
      try {
        const data = await getOrderDetails(reference).unwrap();
        if (["APPROVED", "COMPLETED"].includes(data?.status)) {
          navigateToSuccess(reference, "paypal");
          return;
        }
        if (["VOIDED", "CANCELLED"].includes(data?.status)) {
          handleCancellation();
        }
      } catch (requestError: any) {
        setError(requestError?.data?.message || "Unable to verify the PayPal payment.");
      }
    },
    [getOrderDetails, handleCancellation, navigateToSuccess]
  );

  const onNavigationStateChange = useCallback(
    (state: any) => {
      const url = state?.url;
      if (!url) return;

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return;
      }

      const normalizedUrl = url.toLowerCase();
      const isCancellation =
        normalizedUrl.includes("cancellink") ||
        normalizedUrl.includes("cancel=true") ||
        normalizedUrl.includes("payment-cancel");

      if (isCancellation) {
        handleCancellation();
        return;
      }

      if (String(source || "").toLowerCase() === "paypal" && parsedUrl.searchParams.get("token")) {
        void fetchApprovalStatus(parsedUrl.searchParams.get("token") as string);
        return;
      }

      if (normalizedUrl.includes("success")) {
        const reference = parsedUrl.searchParams.get("reference") || parsedUrl.searchParams.get("trxref");
        if (reference) navigateToSuccess(reference, "paystack");
      }
    },
    [fetchApprovalStatus, handleCancellation, navigateToSuccess, source]
  );

  const onShouldStartLoadWithRequest = useCallback((request: { url?: string }) => {
    if (request.url && isTrustedPaymentUrl(request.url)) return true;
    setError("A payment redirect to an untrusted website was blocked.");
    return false;
  }, []);

  if (!checkoutUrl || !isTrustedPaymentUrl(checkoutUrl)) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>The payment provider did not return a checkout link.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <WebView
        source={{ uri: checkoutUrl }}
        originWhitelist={["https://*"]}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        style={styles.webView}
        onNavigationStateChange={onNavigationStateChange}
        onError={() => setError("The payment page could not be loaded. Check your connection and try again.")}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={styles.loader} size="large" color={palette.primary} />}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 8, backgroundColor: palette.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  webView: { flex: 1, marginTop: 4 },
  loader: { position: "absolute", inset: 0 },
  errorBanner: { backgroundColor: palette.error + "1A", borderRadius: 8, padding: 12, marginBottom: 4 },
  errorText: { ...typography.textBase, color: palette.error, textAlign: "center" },
});

export default PaymentScreen;
