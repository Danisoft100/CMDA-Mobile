import React from "react";
import { Image, Text } from "react-native";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import { typography } from "~/theme";

const IdentityVerificationScreen = ({ navigation }: any) => {
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Identity Verification</Text>
      <Text style={[typography.textBase, typography.fontMedium]}>
        Kindly verify your identity to ensure security of your account
      </Text>

      <Image
        source={require("~/assets/images/identity.png")}
        style={{ maxHeight: 200, resizeMode: "contain", marginVertical: 24, marginHorizontal: "auto" }}
      />

      <Button label="Verify Now" onPress={() => navigation.navigate("bvn")} />
    </AppKeyboardAvoidingView>
  );
};

export default IdentityVerificationScreen;
