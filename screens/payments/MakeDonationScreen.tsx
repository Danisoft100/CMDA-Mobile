import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View, Switch, ScrollView } from "react-native";
import { palette, typography } from "~/theme";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { AREAS_OF_NEED, AREAS_OF_NEED_GLOBAL, PAYPAL_CURRENCIES } from "~/constants/payments";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "~/utils/currencyFormatter";
import SelectField from "~/components/form/SelectField";
import TextField from "~/components/form/TextField";
import Button from "~/components/form/Button";
import AppContainer from "~/components/AppContainer";
import { useInitDonationSessionMutation } from "~/store/api/paymentsApi";

const MakeDonationScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "all", defaultValues: { currency: user.role === "GlobalNetwork" ? "USD" : "NGN" } });

  const [visionPartner, setVisionPartner] = useState(false);
  const [areaOfNeedValues, setAreaOfNeedValues] = useState<any>({});

  const [initDonation, { isLoading: isDonating }] = useInitDonationSessionMutation();

  const handleInitDonate = async (payload: any) => {
    try {
      const data = await initDonation(payload).unwrap();
      if (data.checkout_url) {
        navigation.navigate("pay-init", { paymentFor: "donation", checkoutUrl: data.checkout_url });
        return;
      }

      const approvalUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
      if (!approvalUrl) throw new Error("The payment provider did not return a checkout link.");
      navigation.navigate("pay-init", { paymentFor: "donation", checkoutUrl: approvalUrl, source: "PAYPAL" });
    } catch (error: any) {
      const message = Array.isArray(error?.data?.message)
        ? error.data.message.join("\n")
        : error?.data?.message || error?.message || "Unable to start the donation payment.";
      Alert.alert("Donation could not be started", message);
    }
  };

  const onPreSubmit = (payload: any) => {
    // Build areasOfNeed from the local state (areaOfNeedValues) which tracks enabled areas and amounts
    const areasOfNeed = Object.entries(areaOfNeedValues)
      .filter(([_, value]: [string, any]) => value.enabled && value.amount > 0)
      .map(([name, value]: [string, any]) => ({ name, amount: +value.amount }));

    const minimumAmount = user.role === "GlobalNetwork" ? 5 : 500;
    if (!areasOfNeed.length || totalAmount < minimumAmount) {
      Alert.alert(
        "Enter a valid donation",
        `Select at least one area and donate a minimum of ${formatCurrency(minimumAmount, payload.currency)}.`
      );
      return;
    }

    const recurring = Boolean(visionPartner && payload.frequency);
    const finalPayload = {
      totalAmount,
      recurring,
      ...(recurring ? { frequency: payload.frequency } : {}),
      areasOfNeed,
      currency: payload.currency,
    };
    void handleInitDonate(finalPayload);
  };

  const handleSwitchChange = (area: string) => (value: boolean) => {
    // Update the state for the area of need with the new value of the switch
    setAreaOfNeedValues((prevValues: any) => ({
      ...prevValues,
      [area]: { ...prevValues[area], enabled: value, amount: value ? 0 : undefined },
    }));
  };

  const handleAmountChange = (area: string, value: string) => {
    // Update the amount for the specific area of need
    setAreaOfNeedValues((prevValues: any) => ({
      ...prevValues,
      [area]: { ...prevValues[area], amount: +value },
    }));
  };

  const insets = useSafeAreaInsets();

  const totalAmount = useMemo(
    () => Object.values(areaOfNeedValues).reduce((acc: number, area: any) => acc + (area.amount || 0), 0),
    [areaOfNeedValues]
  );

  return (
    <AppContainer withScrollView={false}>
      <SelectField
        label="currency"
        control={control}
        errors={errors}
        options={
          user.role === "GlobalNetwork"
            ? PAYPAL_CURRENCIES.map((x) => ({ label: x.currency + ` (${x.code})`, value: x.code }))
            : [{ label: "Nigerian Naira (NGN)", value: "NGN" }]
        }
        required
        disabled={user.role !== "GlobalNetwork"}
      />

      <View style={{ gap: 4 }}>
        <Text style={[typography.textBase, typography.fontSemiBold]}>Are you a Vision partner?</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[typography.textBase, typography.fontMedium]}>NO</Text>
          <Switch
            trackColor={{ false: palette.greyLight, true: palette.primary }}
            thumbColor={palette.white}
            ios_backgroundColor={palette.greyLight}
            style={styles.switch}
            onValueChange={(val) => setVisionPartner(val)}
            value={visionPartner}
          />
          <Text style={[typography.textBase, typography.fontMedium]}>YES</Text>
        </View>
        {visionPartner ? (
          <SelectField label="frequency" options={["Monthly", "Annually"]} control={control} errors={errors} required />
        ) : null}
      </View>

      {/* scrolliew for areas of need  */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 12, paddingVertical: 8 }} stickyHeaderIndices={[0]}>
          <View style={{ backgroundColor: palette.background, paddingVertical: 6 }}>
            <Text style={[typography.textLg, typography.fontMedium]}>Areas of Need</Text>
          </View>
          <View style={{ gap: 4 }}>
            {[...(user.role === "GlobalNetwork" ? AREAS_OF_NEED_GLOBAL : AREAS_OF_NEED)].map((item, idx) => {
              // Create a safe key for form field (replace spaces and special chars)
              const fieldKey = item.replace(/[^a-zA-Z0-9]/g, '_');
              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 2, maxWidth: "65%" }}>
                    <Switch
                      trackColor={{ false: palette.greyLight, true: palette.primary }}
                      thumbColor={palette.white}
                      ios_backgroundColor={palette.greyLight}
                      style={styles.switch}
                      onValueChange={handleSwitchChange(item)}
                      value={areaOfNeedValues[item]?.enabled || false}
                    />
                    <Text style={[typography.textBase, typography.fontNormal, { flexWrap: "wrap" }]} numberOfLines={3}>
                      {item}
                    </Text>
                  </View>
                  <View style={{ width: "30%", flexShrink: 0 }}>
                    {areaOfNeedValues[item]?.enabled ? (
                      <TextField
                        label={`areasOfNeed_${fieldKey}`}
                        showLabel={areaOfNeedValues[item]?.enabled && !areaOfNeedValues[item]?.amount}
                        control={control}
                        title="Amount"
                        keyboardType="numeric"
                        errors={errors}
                        required={"Required"}
                        onChangeFn={(value) => handleAmountChange(item, value)}
                        minHeight={40}
                        placeholder={(watch("currency") || "") + " 500"}
                      />
                    ) : null}
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>

      <View style={{ marginBottom: insets.bottom }}>
        <Button
          label={"Donate " + (watch("currency") ? formatCurrency(totalAmount, watch("currency")) : "")}
          onPress={() => handleSubmit(onPreSubmit)()}
          loading={isDonating}
        />
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    height: "80%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingHorizontal: 10,
    gap: 8,
  },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
});

export default MakeDonationScreen;
