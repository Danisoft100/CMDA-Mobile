import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { usePasswordResetMutation, useSetPinMutation } from "~/store/api/authApi";
import { typography } from "~/theme";
import { PASSWORD_PATTERN } from "~/utils/regexValidations";

const ResetPasswordScreen = ({ navigation, route }: any) => {
  const { userName } = route.params;
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    watch,
  } = useForm({ mode: "all" });

  const [passwordReset, { isLoading }] = usePasswordResetMutation();

  const onSubmit = (payload: any) => {
    passwordReset({ ...payload, userId: userName })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Password reset successful. Login to continue" });
        navigation.navigate("sign-in");
      })
      .catch((err) => console.log("ERROR", err));
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Reset Password</Text>
      <Text style={[typography.textBase, typography.fontMedium, { marginTop: -8 }]}>
        Enter the code sent to {userName} and a new password to continue
      </Text>

      <TextField
        label="code"
        title="Reset Code/Token"
        placeholder="Enter code"
        control={control}
        errors={errors}
        required
      />

      <TextField
        title="New Password"
        control={control}
        label="password"
        type="password"
        placeholder="Enter password"
        errors={errors}
        required
        rules={{
          minLength: { value: 8, message: "Must be at least 8 characters" },
          pattern: {
            value: PASSWORD_PATTERN,
            message: "Password must contain lowercase, uppercase, special character & number",
          },
        }}
      />

      <Button label="Reset Password" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
