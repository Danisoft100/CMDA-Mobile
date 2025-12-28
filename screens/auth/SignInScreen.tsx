import { Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
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
import BiometricService from "~/services/BiometricService";

const SignInScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({ mode: "all" });

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await BiometricService.isAvailable();
    const enabled = await BiometricService.isBiometricEnabled();
    const types = await BiometricService.getSupportedTypes();
    
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
    setBiometricTypes(types);
  };

  const handleBiometricLogin = async () => {
    try {
      const credentials = await BiometricService.biometricLogin();
      
      if (!credentials) {
        Toast.show({ 
          type: "error", 
          text1: "Authentication failed",
          text2: "Please try again or use your password"
        });
        return;
      }

      // Login with stored email (password should be handled by backend session)
      loginUser({ email: credentials.email, useBiometric: true })
        .unwrap()
        .then((res: any) => {
          Toast.show({ type: "success", text1: "Login successful" });
          const { user, accessToken } = res.data;
          dispatch(setUser({ user, accessToken }));
          if (user.emailVerified) navigation.navigate("tab");
          else navigation.navigate("verify", { email: credentials.email });
        })
        .catch((error) => {
          Toast.show({ 
            type: "error", 
            text1: "Login failed",
            text2: "Please use your password to login"
          });
          // If biometric login fails, disable it
          BiometricService.disableBiometric();
          setBiometricEnabled(false);
        });
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Error",
        text2: "Biometric authentication failed"
      });
    }
  };

  const handleSignIn = (payload: any) => {
    loginUser(payload)
      .unwrap()
      .then(async (res: any) => {
        Toast.show({ type: "success", text1: "Login successful" });
        const { user, accessToken } = res.data;
        dispatch(setUser({ user, accessToken }));

        // Offer to enable biometric login after successful password login
        if (biometricAvailable && !biometricEnabled) {
          Alert.alert(
            "Enable Biometric Login",
            `Would you like to enable ${biometricTypes.join(' or ')} login for faster access?`,
            [
              {
                text: "Not Now",
                style: "cancel",
              },
              {
                text: "Enable",
                onPress: async () => {
                  const enabled = await BiometricService.enableBiometric({ 
                    email: payload.email 
                  });
                  if (enabled) {
                    Toast.show({ 
                      type: "success", 
                      text1: "Biometric login enabled" 
                    });
                    setBiometricEnabled(true);
                  }
                },
              },
            ]
          );
        }

        if (user.emailVerified) navigation.navigate("tab");
        else navigation.navigate("verify", { email: payload.email });
      })
      .catch((error) => {
        const message = error?.data?.message;
        if (message && message.includes("not verified")) {
          navigation.navigate("verify", { email: payload.email });
        }
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
