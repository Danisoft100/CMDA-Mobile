import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import AppLogo from "~/components/AppLogo";
import Button from "~/components/form/Button";
import { useForm } from "react-hook-form";
import TextField from "~/components/form/TextField";
import { useLoginMutation } from "~/store/api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import Toast from "react-native-toast-message";
import { palette, typography } from "~/theme";

const SignInScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSignIn = (payload: any) => {
    loginUser(payload)
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: "success", text1: "Login successful" });
        const { user, accessToken } = res.data;
        dispatch(setUser({ user, accessToken }));
        navigation.navigate("tab");
      });
  };

  return (
    <AppKeyboardAvoidingView gap={20}>
      <View style={{ alignItems: "center", marginTop: 16 }}>
        <AppLogo />
      </View>

      <TextField
        control={control}
        label="email"
        placeholder="Enter your email or phone number"
        errors={errors}
        required
      />

      <TextField
        control={control}
        label="password"
        type="password"
        placeholder="Enter your password"
        errors={errors}
        required
      />

      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={() => navigation.navigate("forgot-password")}>
          <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <Button label="Sign In" onPress={handleSubmit(handleSignIn)} loading={isLoading} />

      <View style={{ flexDirection: "row" }}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginRight: 4 }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-up")}>
          <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AppKeyboardAvoidingView>
  );
};

export default SignInScreen;
