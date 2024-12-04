import { Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import OTPInput from "~/components/form/OTPInput";
import Button from "~/components/form/Button";
import { useResendVerifyCodeMutation, useVerifyUserMutation } from "~/store/api/authApi";
import Toast from "react-native-toast-message";

const VerifyAccountScreen = ({ navigation, route }: any) => {
  const [otpValue, setOtpValue] = useState("");
  const { email } = route.params;

  const [verifyUser, { isLoading }] = useVerifyUserMutation();
  const [resendVerifyCode, { isLoading: isResending }] = useResendVerifyCodeMutation();

  const handleVerify = () => {
    if (otpValue.length < 6) {
      return Toast.show({ type: "error", text1: "Code must be up to 6 digits" });
    }
    verifyUser({ email, code: otpValue })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Account Verified. Login to continue" });
        navigation.navigate("sign-in");
      });
  };

  const handleResend = () => {
    resendVerifyCode({ email })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Code resent to " + email });
      });
  };

  return (
    <AppContainer withScrollView={false}>
      <Text style={[typography.textBase, typography.fontMedium]}>
        Please enter the 6-digits code we sent to your email address:  {email}
      </Text>

      <OTPInput value={otpValue} onChange={setOtpValue} length={6} />

      <View style={{ flexDirection: "row", marginVertical: 8 }}>
        <Text style={[typography.textBase, typography.fontMedium]}>Did not receive code? </Text>
        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text style={[typography.textBase, typography.fontMedium, { color: palette.primary }]}>
            {isResending ? "Resending Code..." : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button label="Continue" onPress={handleVerify} loading={isLoading} />
    </AppContainer>
  );
};

export default VerifyAccountScreen;
