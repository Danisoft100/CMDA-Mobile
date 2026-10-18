import React, { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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
import { installmentAmount } from "~/utils/paymentUx";
import QueryFeedback from "~/components/QueryFeedback";

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
    isFetching: loadingStatus,
    isError,
    error: statusError,
    refetch: refetchStatus,
  } = useGetSubscriptionStatusQuery(
    { feedbackHandled: true },
    { skip: !visible, refetchOnMountOrArgChange: true },
  );
  const {
    data: zelle,
    isFetching: loadingZelle,
    isError: zelleError,
    refetch: refetchZelle,
  } = useGetZelleSettingsQuery(undefined, {
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
  const [error, setError] = useState("");
  const [showIncomeLevels, setShowIncomeLevels] = useState(false);
  const [init, { isLoading }] = useInitSubscriptionSessionMutation();
  const [createZelle, { isLoading: creating }] =
    useCreateZellePaymentMutation();
  const inset = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const scrollTop = useCallback(
    () => scroll.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
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
  const requested = installmentAmount(amountText, remaining);
  const busy = isLoading || creating;
  const close = () => {
    setIntent(null);
    setAmountText("");
    setError("");
    setTab("regular");
    setMethod("PAYPAL");
    setShowIncomeLevels(false);
    onClose();
  };
  const submit = async () => {
    if (busy || (tab === "regular" && (loadingStatus || isError))) return;
    setError("");
    const amount = requested.amount;
    if (tab === "regular" && requested.error) {
      setError(requested.error);
      return;
    }
    if (
      tab === "regular" &&
      method === "ZELLE" &&
      (!zelle?.enabled || zelleError || loadingZelle)
    ) {
      setError(
        "Zelle is currently unavailable. Choose PayPal or retry loading payment methods.",
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
      setError(
        getApiErrorMessage(
          e,
          "Unable to start your payment. Your choices are still here; please try again.",
        ),
      );
    }
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: palette.background,
          paddingTop: inset.top,
          paddingBottom: inset.bottom,
        }}
      >
        <ScrollView
          ref={scroll}
          key={intent?._id || "plan"}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text
              accessibilityRole="header"
              style={[typography.textLg, typography.fontSemiBold, { flex: 1 }]}
            >
              Membership payment
            </Text>
            <Button
              label="Close"
              dense
              variant="outlined"
              disabled={busy}
              onPress={close}
            />
          </View>
          {intent ? (
            <ZelleReceipt
              onStepChange={scrollTop}
              key={intent._id}
              intent={intent}
              onDone={close}
              onSaveForLater={close}
            />
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
                  {loadingStatus || isError ? (
                    <QueryFeedback
                      label="your membership balance"
                      loading={loadingStatus}
                      error={isError ? statusError : undefined}
                      onRetry={refetchStatus}
                    />
                  ) : (
                    <>
                      <View
                        style={{
                          backgroundColor: palette.white,
                          borderRadius: 12,
                          padding: 16,
                          gap: 8,
                        }}
                      >
                        <Text style={typography.fontSemiBold}>
                          {new Date().getFullYear()} target: {currency}{" "}
                          {annualTarget.toFixed(2)}
                        </Text>
                        <Text>
                          Confirmed: {currency}{" "}
                          {Number(status?.paidAmount || 0).toFixed(2)} ·
                          Remaining: {currency} {remaining.toFixed(2)}
                        </Text>
                      </View>
                      {!uk && !status?.paymentsCount && (
                        <>
                          <Text style={typography.fontSemiBold}>
                            Annual income level
                          </Text>
                          <Text>
                            {
                              INCOME_BRACKETS.find(
                                (item) => item.value === bracket,
                              )?.label
                            }
                          </Text>
                          <Button
                            dense
                            variant="outlined"
                            label={
                              showIncomeLevels
                                ? "Keep this income level"
                                : "Change income level"
                            }
                            onPress={() =>
                              setShowIncomeLevels((value) => !value)
                            }
                          />
                          {showIncomeLevels &&
                            INCOME_BRACKETS.map((item) => (
                              <Button
                                key={item.value}
                                label={item.label}
                                variant={
                                  bracket === item.value ? "filled" : "outlined"
                                }
                                onPress={() => {
                                  setBracket(item.value);
                                  setAmountText("");
                                  setShowIncomeLevels(false);
                                }}
                              />
                            ))}
                        </>
                      )}
                      <Text>Amount to pay now ({currency})</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <Button
                          dense
                          variant="outlined"
                          label={uk ? "£20 installment" : "$10 installment"}
                          disabled={remaining <= 0}
                          onPress={() =>
                            setAmountText(
                              String(Math.min(uk ? 20 : 10, remaining)),
                            )
                          }
                        />
                        <Button
                          dense
                          variant="outlined"
                          label="Pay remaining balance"
                          disabled={remaining <= 0}
                          onPress={() => setAmountText(String(remaining))}
                        />
                      </View>
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
                      {!requested.error ? (
                        <Text style={typography.fontSemiBold}>
                          Pay now: {currency} {requested.amount?.toFixed(2)} ·
                          Remaining after confirmation: {currency}{" "}
                          {Math.max(
                            0,
                            remaining - (requested.amount || 0),
                          ).toFixed(2)}
                        </Text>
                      ) : null}
                      <Text>
                        Pay any amount toward your annual target. Unpaid
                        balances do not carry into the next year.
                      </Text>
                      <Text style={typography.fontSemiBold}>
                        Choose payment method
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
                      {!uk && loadingZelle ? (
                        <Text>Loading payment methods…</Text>
                      ) : null}
                      {!uk && zelleError ? (
                        <>
                          <Text>
                            Zelle could not be loaded. You can still use PayPal.
                          </Text>
                          <Button
                            dense
                            label="Retry payment methods"
                            variant="outlined"
                            onPress={refetchZelle}
                          />
                        </>
                      ) : null}
                      {method === "ZELLE" && !uk ? (
                        <Text>
                          Manual USD transfer. Next you’ll get the recipient and
                          memo, then upload your receipt. Finance confirms your
                          payment before the balance changes.
                        </Text>
                      ) : (
                        <Text>
                          Continue to PayPal to approve your payment securely.
                        </Text>
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
              {error ? (
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  style={{ color: palette.error }}
                >
                  {error}
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
