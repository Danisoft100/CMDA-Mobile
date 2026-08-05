import React from "react";
import { Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { useUpdatePasswordMutation } from "~/store/api/profileApi";
import { selectAuth } from "~/store/slices/authSlice";
import SecureStorageService from "~/services/SecureStorageService";
import { PASSWORD_PATTERN } from "~/utils/regexValidations";
import { palette, typography } from "~/theme";

const ChangePasswordScreen = () => {
  const { user } = useSelector(selectAuth);
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({ mode: "all" });
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const onSubmit = async (payload: any) => {
    try {
      const response = await updatePassword(payload).unwrap();
      await SecureStorageService.storeCredentials(user?.email || "", payload.newPassword);
      reset();
      Toast.show({ type: "success", text1: response?.message || "Password updated successfully" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error || "Password could not be updated" });
    }
  };

  const passwordRules = {
    minLength: { value: 8, message: "Must be at least 8 characters" },
    pattern: { value: PASSWORD_PATTERN, message: "Must contain uppercase, lowercase, number and special character" },
  };

  return (
    <AppKeyboardAvoidingView gap={16} withScrollView>
      <TextField control={control} label="oldPassword" title="Current Password" type="password" errors={errors} required />
      <TextField control={control} label="newPassword" title="New Password" type="password" errors={errors} required rules={passwordRules} />
      <View style={{ backgroundColor: palette.onPrimary, borderRadius: 8, padding: 12 }}>
        <Text style={[typography.textSm, { color: palette.greyDark }]}>Use at least eight characters with uppercase, lowercase, number and special character.</Text>
      </View>
      <TextField
        control={control}
        label="confirmPassword"
        title="Confirm New Password"
        type="password"
        errors={errors}
        required
        rules={{ ...passwordRules, validate: (value: string) => value === watch("newPassword") || "Passwords do not match" }}
      />
      <Button label="Update Password" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;
