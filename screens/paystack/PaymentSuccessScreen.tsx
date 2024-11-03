import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import Button from "~/components/form/Button";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { useSaveDonationMutation, useSaveSubscriptionMutation } from "~/store/api/paymentsApi";
import { updateUser } from "~/store/slices/authSlice";
import { useCreateOrderMutation } from "~/store/api/productsApi";
import { useConfirmEventPaymentMutation } from "~/store/api/eventsApi";

const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { reference, paymentFor } = route.params;

  const [saveDonation, { isLoading: isDonating }] = useSaveDonationMutation();
  const [saveSubscription, { isLoading: isSubscribing }] = useSaveSubscriptionMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmEventPaymentMutation();

  const wasCalled = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (wasCalled.current) return;
    wasCalled.current = true;
    //   confirm payment
    if (paymentFor === "order") {
      createOrder({ reference });
    }
    if (paymentFor === "donation") {
      saveDonation({ reference });
    }
    if (paymentFor === "subscription") {
      saveSubscription({ reference })
        .unwrap()
        .then((res) => {
          dispatch(updateUser(res.user));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceed = () => {
    if (paymentFor === "order") {
      navigation.navigate("more-store-orders");
    } else if (paymentFor === "event") {
      navigation.navigate("events-index", { activeIndex: 1 });
    } else {
      navigation.navigate("pay-index", { activeIndex: paymentFor === "donation" ? 1 : 0 });
    }
  };

  return (
    <AppContainer withScrollView={false}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MCIcon name="check-all" size={40} color={palette.primary} />
        </View>
        <Text style={[typography.textXl, typography.fontSemiBold, { textAlign: "center" }]}>Payment Successful</Text>
        <Text style={[typography.textBase, typography.fontMedium, { textAlign: "center" }]}>
          Your payment for your {paymentFor?.toUpperCase()} was successful. Click the button below to proceed.
        </Text>
        <Button
          label="Proceed"
          onPress={handleProceed}
          loading={isDonating || isSubscribing || isCreating || isConfirming}
          style={{ marginTop: 8, width: "100%" }}
        />
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    padding: 24,
    marginVertical: 48,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: palette.greyLight,
  },
  iconContainer: {
    backgroundColor: palette.onPrimaryContainer,
    height: 64,
    width: 64,
    overflow: "hidden",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PaymentSuccessScreen;
