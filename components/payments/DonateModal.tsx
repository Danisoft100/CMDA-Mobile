import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Switch,
  ScrollView,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import { useForm } from "react-hook-form";
import Button from "../form/Button";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { AREAS_OF_NEED, AREAS_OF_NEED_GLOBAL, PAYPAL_CURRENCIES } from "~/constants/payments";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "~/utils/currencyFormatter";

interface IDonateModal {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  loading: boolean;
}

const DonateModal = ({ visible, onClose, onSubmit, loading }: IDonateModal) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: "all" });

  const [visionPartner, setVisionPartner] = useState(false);
  const [areaOfNeedValues, setAreaOfNeedValues] = useState<any>({}); // To track the amount for each area of need

  const { user } = useSelector(selectAuth);

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const onPreSubmit = (payload: any) => {
    payload = {
      ...payload,
      totalAmount,
      recurring: !!(visionPartner && payload.frequency),
      frequency: visionPartner && payload.frequency ? payload.frequency : null,
      areasOfNeed: Object.entries(payload.areasOfNeed)
        .map(([name, amount]) => (amount ? { name, amount: +amount } : null))
        .filter(Boolean),
    };
    onSubmit(payload);
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
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={[styles.modalContainer, { paddingBottom: insets.bottom }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <Text style={[typography.textXl, typography.fontSemiBold, { textTransform: "capitalize" }]}>
                New Donation
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ gap: 12 }}>
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
                    <SelectField
                      label="frequency"
                      options={["Monthly", "Annually"]}
                      control={control}
                      errors={errors}
                      required
                    />
                  ) : null}
                </View>

                <View>
                  <Text style={[typography.textLg, typography.fontMedium]}>Areas of Need</Text>
                  <View style={{ gap: 4 }}>
                    {[...(user.role === "GlobalNetwork" ? AREAS_OF_NEED_GLOBAL : AREAS_OF_NEED)].map((item, idx) => (
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
                          <Text
                            style={[typography.textBase, typography.fontNormal, { flexWrap: "wrap" }]}
                            numberOfLines={3}
                          >
                            {item}
                          </Text>
                        </View>
                        <View style={{ width: "30%", flexShrink: 0 }}>
                          {areaOfNeedValues[item]?.enabled ? (
                            <TextField
                              label={`areasOfNeed[${item}]`}
                              showLabel={areaOfNeedValues[item]?.enabled && !areaOfNeedValues[item]?.amount}
                              control={control}
                              title="Amount"
                              keyboardType="number-pad"
                              errors={errors}
                              required={"Required"}
                              onChangeFn={(value) => handleAmountChange(item, value)}
                              minHeight={40}
                              placeholder={(watch("currency") || "") + " 500"}
                            />
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
            <View style={{ marginBottom: insets.bottom }}>
              <Button
                label={"Donate " + (watch("currency") ? formatCurrency(totalAmount, watch("currency")) : "")}
                onPress={() => handleSubmit(onPreSubmit)()}
                loading={loading}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
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
  switch: { transform: [{ scaleX: 0.65 }, { scaleY: 0.6 }] },
});

export default DonateModal;
