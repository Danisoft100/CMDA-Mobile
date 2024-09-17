import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { useSetPinMutation } from "~/store/api/authApi";
import { typography } from "~/theme";

const SetPinScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    watch,
  } = useForm({ mode: "all" });

  const [setPin, { isLoading }] = useSetPinMutation();

  const handleSetPin = (payload: any) => {
    setPin({ pin: payload.newPin })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "PIN setup successful" });
        navigation.navigate("tab");
      });
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Set Your PIN</Text>
      <Text style={[typography.textBase, typography.fontMedium]}>
        The PIN will be used to log in to your account and authorize transactions
      </Text>

      <TextField
        label="newPin"
        title="Create New PIN"
        type="password"
        placeholder="Enter New PIN"
        keyboardType="number-pad"
        control={control}
        errors={errors}
        required
        rules={{
          minLength: { value: 4, message: "Pin must be 4 digits" },
          maxLength: { value: 4, message: "Pin must be 4 digits" },
        }}
      />

      <TextField
        label="confirmPin"
        title="Confirm PIN"
        type="password"
        placeholder="Confirm New PIN"
        keyboardType="number-pad"
        control={control}
        errors={errors}
        required
        rules={{
          minLength: { value: 4, message: "Pin must be 4 digits" },
          maxLength: { value: 4, message: "Pin must be 4 digits" },
          pattern: { value: getValues("newPin") === watch("confirmPin"), message: "PIN does not match" },
        }}
      />

      <Button label="Set PIN" onPress={handleSubmit(handleSetPin)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default SetPinScreen;
