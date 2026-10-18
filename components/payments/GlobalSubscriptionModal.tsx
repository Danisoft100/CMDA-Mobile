import React, { useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "~/components/form/Button";
import {
  GLOBAL_INCOME_BASED_PRICING,
  INCOME_BRACKETS,
  LIFETIME_MEMBERSHIPS,
  isUkEuropeGlobalMember,
} from "~/constants/payments";
import {
  useGetSubscriptionStatusQuery,
  useInitSubscriptionSessionMutation,
} from "~/store/api/paymentsApi";
import {
  useCreateZellePaymentMutation,
  useGetZelleSettingsQuery,
} from "~/store/api/zelleApi";
import { selectAuth } from "~/store/slices/authSlice";
import { getPayPalApprovalUrl } from "~/utils/paypal";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";
import { palette, typography } from "~/theme";
import { ZelleReceipt } from "./ZellePayments";

export default function GlobalSubscriptionModal({
  visible,
  onClose,
  navigation,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}) {
  const { user } = useSelector(selectAuth);
  const uk = isUkEuropeGlobalMember(user);
  const {
    data: status,
    isLoading: loadingStatus,
    isError,
  } = useGetSubscriptionStatusQuery({}, { skip: !visible, refetchOnMountOrArgChange: true });
  const { data: zelle } = useGetZelleSettingsQuery(undefined, {
    skip: !visible,
  });
  const [tab, setTab] = useState<"regular" | "lifetime">("regular");
  const [bracket, setBracket] = useState(
    user?.incomeBracket || "less_than_50k",
  );
  const [lifetime, setLifetime] = useState("gold");
  const [amountText, setAmountText] = useState("");
  const [method, setMethod] = useState("PAYPAL");
  const [intent, setIntent] = useState<any>(null);
  const [init, { isLoading }] = useInitSubscriptionSessionMutation();
  const [createZelle, { isLoading: creating }] =
    useCreateZellePaymentMutation();
  const inset = useSafeAreaInsets();
  const selectedBracket = status?.paymentsCount
    ? status.incomeBracket || bracket
    : bracket;
  const annualTarget = uk
    ? 240
    : GLOBAL_INCOME_BASED_PRICING[
        selectedBracket as keyof typeof GLOBAL_INCOME_BASED_PRICING
      ]?.annual || 100;
  const remaining = Math.max(0, annualTarget - Number(status?.paidAmount || 0));
  const currency = uk ? "GBP" : "USD";
  const close = () => {
    setIntent(null);
    setAmountText("");
    onClose();
  };
  const submit = async () => {
    const amount = amountText === "" ? remaining : Number(amountText);
    if (
      tab === "regular" &&
      (!Number.isFinite(amount) || amount <= 0 || amount > remaining)
    ) {
      Alert.alert(
        "Check the amount",
        "Enter an amount greater than zero and no more than your remaining balance.",
      );
      return;
    }
    try {
      if (tab === "regular" && method === "ZELLE" && !uk) {
        setIntent(
          await createZelle({
            context: "SUBSCRIPTION",
            amount,
            incomeBracket: selectedBracket,
            targetYear: new Date().getFullYear(),
          }).unwrap(),
        );
        return;
      }
      const data = await init(
        tab === "lifetime"
          ? { selectedTab: "lifetime", lifetimeType: lifetime }
          : { selectedTab: "regular", amount, incomeBracket: selectedBracket },
      ).unwrap();
      const url = getPayPalApprovalUrl(data);
      if (!url) throw new Error("PayPal did not return a checkout link.");
      close();
      navigation.navigate("pay-init", {
        checkoutUrl: url,
        paymentFor: "subscription",
        source: "PAYPAL",
      });
    } catch (e) {
      Alert.alert("Unable to start payment", getApiErrorMessage(e));
    }
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: palette.background,
          paddingTop: inset.top,
          paddingBottom: inset.bottom,
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          <Text style={[typography.textLg, typography.fontSemiBold]}>
            Membership payment
          </Text>
          <Button label="Close" variant="outlined" onPress={close} />
          {intent ? (
            <ZelleReceipt intent={intent} onDone={close} />
          ) : (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <Button
                  label="Annual / installments"
                  variant={tab === "regular" ? "filled" : "outlined"}
                  onPress={() => setTab("regular")}
                />
                <Button
                  label="Lifetime"
                  variant={tab === "lifetime" ? "filled" : "outlined"}
                  onPress={() => setTab("lifetime")}
                />
              </View>
              {tab === "lifetime" ? (
                Object.entries(LIFETIME_MEMBERSHIPS).map(([key, plan]) => (
                  <Button
                    key={key}
                    label={`${plan.label} · USD ${plan.price}`}
                    variant={lifetime === key ? "filled" : "outlined"}
                    onPress={() => setLifetime(key)}
                  />
                ))
              ) : (
                <>
                  {loadingStatus ? (
                    <Text>Loading your balance...</Text>
                  ) : isError ? (
                    <Text>
                      Unable to load your balance. Reopen this screen to try
                      again.
                    </Text>
                  ) : (
                    <>
                      <Text>
                        {new Date().getFullYear()} target: {currency}{" "}
                        {annualTarget.toFixed(2)}
                      </Text>
                      <Text>
                        Confirmed: {currency}{" "}
                        {Number(status?.paidAmount || 0).toFixed(2)} ·
                        Remaining: {currency} {remaining.toFixed(2)}
                      </Text>
                      {!uk && !status?.paymentsCount && (
                        <>
                          <Text>Annual income level</Text>
                          {INCOME_BRACKETS.map((item) => (
                            <Button
                              key={item.value}
                              label={item.label}
                              variant={
                                bracket === item.value ? "filled" : "outlined"
                              }
                              onPress={() => setBracket(item.value)}
                            />
                          ))}
                        </>
                      )}
                      <Text>Amount to pay now ({currency})</Text>
                      <TextInput
                        accessibilityLabel="Amount to pay now"
                        keyboardType="decimal-pad"
                        value={amountText}
                        onChangeText={setAmountText}
                        placeholder={String(remaining)}
                        style={{
                          borderWidth: 1,
                          borderColor: palette.greyLight,
                          borderRadius: 8,
                          padding: 12,
                          minHeight: 48,
                        }}
                      />
                      <Text>
                        Pay any amount toward your annual target. Unpaid
                        balances do not carry into the next year.
                      </Text>
                      <Button
                        label="PayPal"
                        variant={method === "PAYPAL" ? "filled" : "outlined"}
                        onPress={() => setMethod("PAYPAL")}
                      />
                      {!uk && zelle?.enabled && (
                        <Button
                          label="Zelle (USD transfer)"
                          variant={method === "ZELLE" ? "filled" : "outlined"}
                          onPress={() => setMethod("ZELLE")}
                        />
                      )}
                    </>
                  )}
                </>
              )}
              <Button
                label={
                  tab === "regular" && method === "ZELLE" && !uk
                    ? "Continue with Zelle"
                    : "Continue to PayPal"
                }
                disabled={
                  tab === "regular" &&
                  (loadingStatus || isError || remaining <= 0)
                }
                loading={isLoading || creating}
                onPress={submit}
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
