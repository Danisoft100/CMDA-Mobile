import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { usePasswordForgotMutation } from "~/store/api/authApi";
import { typography } from "~/theme";
import { EMAIL_PATTERN } from "~/utils/regexValidations";

const ForgotPassword = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const [passwordForgot, { isLoading }] = usePasswordForgotMutation();

  const onSubmit = ({ userName }: any) => {
    passwordForgot(userName)
      .unwrap()
      .then((res) => {
        Toast.show({ type: "success", text1: res?.message });
        navigation.navigate("reset-password", { userName });
      });
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Forgot Your Password?</Text>
      <Text style={[typography.textBase, typography.fontMedium, { marginTop: -8 }]}>
        Enter the email associated with your account to get a password reset token
      </Text>

      <TextField
        label="userName"
        showLabel={false}
        placeholder="Enter your email address"
        keyboardType="email-address"
        control={control}
        errors={errors}
        required
        rules={{
          pattern: { value: EMAIL_PATTERN, message: "Invalid email address" },
        }}
      />

      <Button label="Continue" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default ForgotPassword;
