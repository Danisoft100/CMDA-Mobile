import React from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { usePasswordResetMutation } from "~/store/api/authApi";
import { palette, typography } from "~/theme";
import { PASSWORD_PATTERN } from "~/utils/regexValidations";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";

const ResetPasswordScreen = ({ navigation, route }: any) => {
  const email = route.params?.email;
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" });

  const [passwordReset, { isLoading }] = usePasswordResetMutation();

  const onSubmit = (payload: any) => {
    passwordReset({ ...payload, token: payload.token.trim(), ...(email ? { email: email.trim() } : {}) })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Password reset successful", text2: "Login to continue" });
        navigation.navigate("sign-in");
      })
      .catch((error) => Toast.show({ type: "error", text1: getApiErrorMessage(error, "Unable to reset password") }));
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.textBase, typography.fontMedium, { marginTop: -8 }]}>
        Enter the code sent to {email} and a new password to continue
      </Text>

      <TextField
        label="token"
        title="Reset Code/Token"
        placeholder="Enter code"
        control={control}
        errors={errors}
        required
        rules={{ pattern: { value: /^\d{6}$/, message: "Enter the six-digit code from your email" } }}
      />
      <TextField
        title="New Password"
        control={control}
        label="newPassword"
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
      />      <View style={{ marginTop: -16, marginBottom: 8 }}>
        <Text style={[typography.textSm, { color: palette.grey, lineHeight: 18 }]}>
          Password must contain:
        </Text>
        <Text style={[typography.textXs, { color: palette.grey, marginLeft: 8, lineHeight: 16 }]}>
          • At least 8 characters{'\n'}
          • One uppercase letter (A-Z){'\n'}
          • One lowercase letter (a-z){'\n'}
          • One number (0-9){'\n'}
          • One special character (!@#$%^&*)
        </Text>
      </View>

      <TextField
        title="Confirm New Password"
        control={control}
        label="confirmPassword"
        type="password"
        placeholder="Enter password again"
        errors={errors}
        required
        rules={{
          minLength: { value: 8, message: "Must be at least 8 characters" },
          pattern: {
            value: PASSWORD_PATTERN,
            message: "Password must contain lowercase, uppercase, special character & number",
          },
          validate: (value: string) => value === watch("newPassword") || "Passwords do not match",
        }}
      />

      <Button label="Reset Password" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
