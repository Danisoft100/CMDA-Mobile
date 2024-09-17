import { Platform, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import { useForm } from "react-hook-form";
import TextField from "~/components/form/TextField";
import { typography } from "~/theme";
import { useSignUpMutation } from "~/store/api/authApi";
import Toast from "react-native-toast-message";
import { EMAIL_PATTERN, PASSWORD_PATTERN, PHONE_NUMBER_NG } from "~/utils/regexValidations";
import * as Application from "expo-application";

const SignUpScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const [mode, setMode] = useState("Email");
  const [deviceId, setDeviceId] = useState("");
  const [signUp, { isLoading }] = useSignUpMutation();

  useEffect(() => {
    const getDeviceId = async () => {
      let id: any = "";
      if (Platform.OS === "android") {
        id = Application.getAndroidId();
      }
      if (Platform.OS === "ios") {
        id = await Application.getIosIdForVendorAsync();
      }
      setDeviceId(id);
    };

    getDeviceId();
  }, []);

  const handleSignUp = (payload: any) => {
    const data = {
      emailOrPhoneNumber: mode === "Email" ? payload?.email : payload.phone,
      password: payload.password,
      referralCode: payload?.referral,
      deviceId,
    };
    signUp(data)
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: "success", text1: "Account created successfully" });
        navigation.navigate("verify", { userId: res.data?.userId, emailOrPhoneNumber: data.emailOrPhoneNumber });
      });
  };

  return (
    <AppKeyboardAvoidingView gap={24}>
      <Text style={[typography.textLg]}>Hi, Welcome to Fuhrer</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {["Email", "Phone"].map((item) => (
          <Button
            key={item}
            variant={mode === item ? "filled" : "outlined"}
            label={"With " + item}
            onPress={() => setMode(item)}
            style={{ flex: 1 }}
            dense
          />
        ))}
      </View>

      {mode === "Email" && (
        <TextField
          control={control}
          label="email"
          title="Email Address"
          type="email"
          placeholder="Enter your email address"
          errors={errors}
          required
          rules={{ pattern: { value: EMAIL_PATTERN, message: "Invalid email address" } }}
        />
      )}

      {mode === "Phone" && (
        <TextField
          control={control}
          label="phone"
          title="Phone Number"
          placeholder="e.g. +2348032616345"
          keyboardType="phone-pad"
          errors={errors}
          required
          rules={{
            pattern: { value: PHONE_NUMBER_NG, message: "Phone number must be in format e.g. 08012345678" },
          }}
        />
      )}

      <TextField
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

      <TextField
        control={control}
        label="referral"
        title="Referral (optional)"
        placeholder="Enter referral ID"
        errors={errors}
      />

      <Button label="Sign Up" onPress={handleSubmit(handleSignUp)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default SignUpScreen;
