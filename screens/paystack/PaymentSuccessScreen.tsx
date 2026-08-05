import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import Button from "~/components/form/Button";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { useSaveDonationMutation, useSaveSubscriptionMutation } from "~/store/api/paymentsApi";
import { updateUser } from "~/store/slices/authSlice";
import { useCreateOrderMutation } from "~/store/api/productsApi";
import { useConfirmEventPaymentMutation } from "~/store/api/eventsApi";
import Loading from "~/components/Loading";

type ConfirmationStatus = "processing" | "success" | "already-confirmed" | "error";

const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { reference, paymentFor, source } = route.params || {};
  const [saveDonation] = useSaveDonationMutation();
  const [saveSubscription] = useSaveSubscriptionMutation();
  const [createOrder] = useCreateOrderMutation();
  const [confirmEventPayment] = useConfirmEventPaymentMutation();
  const [status, setStatus] = useState<ConfirmationStatus>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const dispatch = useDispatch();

  const confirmPayment = useCallback(async () => {
    if (!reference || !paymentFor) {
      setErrorMessage("The payment reference is missing. Check your transaction history before trying again.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage("");
    const payload = { reference, source: String(source || "paystack").toLowerCase() };

    try {
      if (paymentFor === "order") {
        await createOrder(payload).unwrap();
      } else if (paymentFor === "donation") {
        await saveDonation(payload).unwrap();
      } else if (paymentFor === "subscription") {
        const response = await saveSubscription(payload).unwrap();
        if (response?.user) dispatch(updateUser(response.user));
      } else if (paymentFor === "event" || paymentFor === "conference") {
        await confirmEventPayment(payload).unwrap();
      } else {
        throw new Error("Unsupported payment type");
      }
      setStatus("success");
    } catch (error: any) {
      if (error?.status === 409) {
        setStatus("already-confirmed");
        return;
      }
      setErrorMessage(error?.data?.message || error?.message || "The payment could not be verified.");
      setStatus("error");
    }
  }, [confirmEventPayment, createOrder, dispatch, paymentFor, reference, saveDonation, saveSubscription, source]);

  useEffect(() => {
    void confirmPayment();
  }, [attempt, confirmPayment]);

  const handleProceed = () => {
    if (paymentFor === "order") {
      navigation.replace("more-store-orders");
    } else if (paymentFor === "event" || paymentFor === "conference") {
      navigation.replace("events-index", { activeIndex: 1 });
    } else {
      navigation.replace("pay-index", { activeIndex: paymentFor === "donation" ? 1 : 0 });
    }
  };

  if (status === "processing") {
    return (
      <AppContainer withScrollView={false}>
        <View style={styles.card}>
          <Loading />
          <Text style={styles.message}>Verifying your payment…</Text>
        </View>
      </AppContainer>
    );
  }

  const isError = status === "error";
  const alreadyConfirmed = status === "already-confirmed";

  return (
    <AppContainer withScrollView={false}>
      <View style={styles.card}>
        <View style={[styles.iconContainer, isError && styles.errorIcon]}>
          <MCIcon name={isError ? "alert-circle-outline" : "check-all"} size={40} color={isError ? palette.error : palette.primary} />
        </View>
        <Text style={styles.title}>
          {isError ? "Payment Verification Failed" : alreadyConfirmed ? "Payment Already Confirmed" : "Payment Successful"}
        </Text>
        <Text style={styles.message}>
          {isError
            ? errorMessage
            : `Your ${paymentFor?.toUpperCase()} payment ${alreadyConfirmed ? "was already recorded" : "has been verified"}.`}
        </Text>
        {isError ? (
          <>
            <Button label="Try Verification Again" onPress={() => setAttempt((value) => value + 1)} style={styles.button} />
            <Button label="View Transactions" variant="outlined" onPress={handleProceed} style={styles.button} />
          </>
        ) : (
          <Button label="Proceed" onPress={handleProceed} style={styles.button} />
        )}
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
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: palette.greyLight,
  },
  iconContainer: {
    backgroundColor: palette.onPrimaryContainer,
    height: 64,
    width: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: { backgroundColor: palette.error + "1A" },
  title: { ...typography.textXl, ...typography.fontSemiBold, textAlign: "center" },
  message: { ...typography.textBase, ...typography.fontMedium, textAlign: "center" },
  button: { marginTop: 4, width: "100%" },
});

export default PaymentSuccessScreen;
