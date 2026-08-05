import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";

import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import AppLogo from "~/components/AppLogo";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { useLoginMutation } from "~/store/api/authApi";
import { setUser } from "~/store/slices/authSlice";
import { palette, typography } from "~/theme";
import BiometricService, { BiometricType } from "~/services/BiometricService";
import PINManager from "~/services/PINManager";
import { useTutorial } from "~/contexts/TutorialContext";
import OnboardingTutorialService from "~/services/OnboardingTutorialService";
import PushNotificationService from "~/services/PushNotificationService";
import TokenManager from "~/services/TokenManager";

const getDisplayNameFromEmail = (email?: string | null) => {
  if (!email) return "CMDA member";
  const localPart = email.split("@")[0];
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const SignInScreen = ({ navigation }: any) => {
  const isVisualPreview =
    __DEV__ &&
    Platform.OS === "web" &&
    (globalThis as any).location?.search?.includes("preview=quick-unlock");
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { start: startTutorial } = useTutorial();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<BiometricType[]>([]);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [isPinLockedOut, setIsPinLockedOut] = useState(false);
  const [returningName, setReturningName] = useState("CMDA member");
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [checkingQuickUnlock, setCheckingQuickUnlock] = useState(true);

  useEffect(() => {
    const loadQuickUnlock = async () => {
      try {
        const [available, enabled, types, biometricLocked, pinStatus, pinLocked, storedEmail] = await Promise.all([
          BiometricService.isAvailable(),
          BiometricService.isBiometricEnabled(),
          BiometricService.getSupportedTypes(),
          BiometricService.isLockedOut(),
          PINManager.isPINEnabled(),
          PINManager.isLockedOut(),
          TokenManager.getStoredEmail(),
        ]);

        setBiometricAvailable(isVisualPreview || available);
        setBiometricEnabled(isVisualPreview || enabled);
        setBiometricTypes(isVisualPreview ? ["fingerprint"] : types);
        setIsLockedOut(isVisualPreview ? false : biometricLocked);
        setPinEnabled(isVisualPreview || pinStatus);
        setIsPinLockedOut(isVisualPreview ? false : pinLocked);
        setReturningName(isVisualPreview ? "Dr Ada Okafor" : getDisplayNameFromEmail(storedEmail));
      } catch (error) {
        console.error("[SignInScreen] Error loading quick unlock:", error);
      } finally {
        setCheckingQuickUnlock(false);
      }
    };

    loadQuickUnlock();
  }, []);

  const biometricName = useCallback(() => {
    if (biometricTypes.includes("faceId")) return "Face ID";
    if (biometricTypes.includes("fingerprint")) return "fingerprint";
    if (biometricTypes.includes("iris")) return "iris scan";
    return "biometric";
  }, [biometricTypes]);

  const biometricIcon = useCallback((): keyof typeof MaterialIcons.glyphMap => {
    return biometricTypes.includes("faceId") ? "face" : "fingerprint";
  }, [biometricTypes]);

  const navigateAfterLogin = async (user: any, email: string) => {
    try {
      await PushNotificationService.registerPushTokenOnLogin();
    } catch (error) {
      console.error("[SignInScreen] Failed to register push token:", error);
    }

    if (user.emailVerified) {
      navigation.navigate("tab");
      const shouldShowTutorial = await OnboardingTutorialService.shouldShowTutorial();
      if (shouldShowTutorial) {
        setTimeout(() => startTutorial(), 500);
      }
    } else {
      navigation.navigate("verify", { email });
    }
  };

  const completeLogin = async (res: any, email: string) => {
    const { user, accessToken, refreshToken, accessTokenExpiresAt } = res.data;
    await TokenManager.storeTokens({
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      email,
    });
    dispatch(setUser({ user, accessToken }));
    Toast.show({ type: "success", text1: "Welcome back" });
    await navigateAfterLogin(user, email);
  };

  const handleBiometricLogin = async () => {
    if (biometricLoading) return;
    setBiometricLoading(true);

    try {
      const credentials = await BiometricService.biometricLogin();
      if (!credentials) {
        const lockedOut = await BiometricService.isLockedOut();
        setIsLockedOut(lockedOut);
        Toast.show({
          type: "error",
          text1: lockedOut ? `${biometricName()} temporarily unavailable` : "Couldn’t verify your identity",
          text2: lockedOut ? "Use your password to continue." : "Try again or choose another sign-in method.",
        });
        return;
      }

      const res = await loginUser({ email: credentials.email, password: credentials.password }).unwrap();
      await BiometricService.resetFailedAttempts();
      await completeLogin(res, credentials.email);
    } catch (error: any) {
      console.error("[SignInScreen] Biometric login error:", error);
      const isNetworkError = !error?.data && (error?.message?.includes('Network') || error?.status === undefined);
      if (isNetworkError) {
        Toast.show({
          type: "error",
          text1: "Network error",
          text2: "Check your connection and try again.",
        });
      } else {
        await BiometricService.disableBiometric();
        setBiometricEnabled(false);
        setShowPasswordForm(true);
        Toast.show({
          type: "error",
          text1: "Password sign-in required",
          text2: `Sign in again to restore ${biometricName()}.`,
        });
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handlePinLogin = () => {
    setShowMethodSheet(false);
    navigation.navigate("pin-entry", {
      mode: "login",
      onSuccess: async (pin: string) => {
        setPinLoading(true);
        try {
          const credentials = await PINManager.validatePIN(pin);
          if (!credentials) {
            const lockedOut = await PINManager.isLockedOut();
            setIsPinLockedOut(lockedOut);
            const remaining = await PINManager.getRemainingAttempts();
            Toast.show({
              type: "error",
              text1: lockedOut ? "PIN temporarily unavailable" : "Incorrect PIN",
              text2: lockedOut ? "Use your password to continue." : `${remaining} attempts remaining`,
            });
            navigation.goBack();
            return;
          }

          const res = await loginUser({ email: credentials.email, password: credentials.password }).unwrap();
          await PINManager.resetFailedAttempts();
          await completeLogin(res, credentials.email);
        } catch (error) {
          console.error("[SignInScreen] PIN login error:", error);
          await PINManager.disablePIN();
          setPinEnabled(false);
          Toast.show({ type: "error", text1: "Please sign in with your password" });
          navigation.goBack();
        } finally {
          setPinLoading(false);
        }
      },
      onCancel: () => navigation.goBack(),
    });
  };

  const handleSignIn = async (payload: any) => {
    try {
      const res = await loginUser(payload).unwrap();
      await BiometricService.resetFailedAttempts();
      await PINManager.resetFailedAttempts();
      await PINManager.storeCredentials(payload.email, payload.password);
      setIsLockedOut(false);
      setIsPinLockedOut(false);
      await completeLogin(res, payload.email);
    } catch (error: any) {
      const message = error?.data?.message;
      if (message?.includes("not verified")) {
        navigation.navigate("verify", { email: payload.email });
      }
    }
  };

  const biometricReady = biometricAvailable && biometricEnabled && !isLockedOut;
  const pinReady = pinEnabled && !isPinLockedOut;
  const quickUnlockReady = biometricReady || pinReady;

  const openPasswordForm = () => {
    setShowMethodSheet(false);
    setShowPasswordForm(true);
  };

  const renderMethodSheet = () => (
    <Modal
      visible={showMethodSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMethodSheet(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setShowMethodSheet(false)} />
        <View style={styles.methodSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Choose a sign-in method</Text>
          <Text style={styles.sheetSubtitle}>Your secure alternatives are always available.</Text>

          {pinReady && (
            <TouchableOpacity style={styles.methodRow} onPress={handlePinLogin} disabled={pinLoading}>
              <View style={styles.methodIcon}>
                {pinLoading ? (
                  <ActivityIndicator size="small" color={palette.primary} />
                ) : (
                <MaterialIcons name="dialpad" size={24} color={palette.primary} />
                )}
              </View>
              <View style={styles.methodCopy}>
                <Text style={styles.methodTitle}>Use PIN</Text>
                <Text style={styles.methodSubtitle}>Enter your CMDA quick-access PIN</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={palette.grey} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.methodRow} onPress={openPasswordForm}>
            <View style={styles.methodIcon}>
              <MaterialIcons name="password" size={24} color={palette.primary} />
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodTitle}>Use password</Text>
              <Text style={styles.methodSubtitle}>Sign in with your email and password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={palette.grey} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (checkingQuickUnlock) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Preparing secure sign-in…</Text>
      </SafeAreaView>
    );
  }

  if (quickUnlockReady && !showPasswordForm) {
    const primaryLabel = biometricReady ? `Unlock with ${biometricName()}` : "Unlock with PIN";
    const primaryAction = biometricReady ? handleBiometricLogin : handlePinLogin;

    return (
      <SafeAreaView style={styles.quickUnlockRoot} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.brandPanel}>
          <Image source={require("../../assets/CMDALOGO_white.png")} style={styles.brandMotif} />
          <View style={styles.brandLockup}>
            <Image source={require("../../assets/CMDALOGO_white.png")} style={styles.brandMark} />
            <View>
              <Text style={styles.brandName}>CMDA</Text>
              <Text style={styles.brandCountry}>NIGERIA</Text>
            </View>
          </View>

          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.returningName}>{returningName}</Text>
            <Text style={styles.communityCopy}>Your CMDA community is ready.</Text>
          </View>
        </View>

        <View style={styles.unlockSheet}>
          <View style={styles.unlockIconCircle}>
            <MaterialIcons
              name={biometricReady ? biometricIcon() : "dialpad"}
              size={48}
              color={palette.primary}
            />
          </View>
          <Text style={styles.unlockTitle}>Unlock to continue</Text>
          <Text style={styles.unlockSubtitle}>
            {biometricReady
              ? `Use your ${biometricName()} or choose another secure method.`
              : "Enter your PIN or choose another secure method."}
          </Text>

          <TouchableOpacity
            style={styles.primaryUnlockButton}
            onPress={primaryAction}
            disabled={biometricLoading || pinLoading}
            activeOpacity={0.82}
          >
            {biometricLoading || pinLoading ? (
              <ActivityIndicator size="small" color={palette.white} />
            ) : (
              <MaterialIcons name={biometricReady ? biometricIcon() : "dialpad"} size={24} color={palette.white} />
            )}
            <Text style={styles.primaryUnlockText}>{biometricLoading ? "Verifying…" : primaryLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.alternativeButton} onPress={() => setShowMethodSheet(true)}>
            <MaterialIcons name="lock-outline" size={24} color={palette.primary} />
            <Text style={styles.alternativeText}>Use PIN or password</Text>
            <MaterialIcons name="chevron-right" size={26} color={palette.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trustRow}
            disabled={!isVisualPreview}
            activeOpacity={1}
            accessibilityRole={isVisualPreview ? "button" : undefined}
            testID={isVisualPreview ? "security-preview-link" : undefined}
            onPress={() => navigation.navigate("security-preview")}
          >
            <MaterialIcons name="verified-user" size={22} color={palette.secondary} />
            <Text style={styles.trustText}>Secure access  •  CMDA Nigeria</Text>
          </TouchableOpacity>
        </View>
        {renderMethodSheet()}
      </SafeAreaView>
    );
  }

  return (
    <AppKeyboardAvoidingView gap={18}>
      <StatusBar style="dark" />
      <TouchableOpacity
        style={styles.backToUnlock}
        onPress={() => (quickUnlockReady ? setShowPasswordForm(false) : navigation.goBack())}
      >
        <MaterialIcons name="arrow-back" size={22} color={palette.primary} />
        <Text style={styles.backToUnlockText}>{quickUnlockReady ? "Back to quick unlock" : "Back"}</Text>
      </TouchableOpacity>

      <View style={styles.passwordHeader}>
        <AppLogo height={88} />
        <Text style={styles.passwordTitle}>Sign in with password</Text>
        <Text style={styles.passwordSubtitle}>Enter your details to access your CMDA account.</Text>
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

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("forgot-password")}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button label="Sign In" onPress={handleSubmit(handleSignIn)} loading={isLoading} />

      {(isLockedOut || isPinLockedOut) && (
        <View style={styles.lockedOutContainer}>
          <MaterialIcons name="info-outline" size={20} color={palette.warning} />
          <Text style={styles.lockedOutText}>Quick unlock is temporarily unavailable. Password sign-in still works.</Text>
        </View>
      )}

      <View style={styles.signUpRow}>
        <Text style={styles.signUpPrompt}>New to CMDA?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-up")}>
          <Text style={styles.signUpAction}>Create account</Text>
        </TouchableOpacity>
      </View>
      {renderMethodSheet()}
    </AppKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
  },
  loadingText: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 14,
  },
  quickUnlockRoot: {
    flex: 1,
    backgroundColor: palette.primary,
  },
  brandPanel: {
    flex: 0.46,
    minHeight: 300,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 34,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  brandMotif: {
    position: "absolute",
    width: 330,
    height: 330,
    resizeMode: "contain",
    opacity: 0.08,
    right: -94,
    bottom: -58,
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 48,
    height: 58,
    resizeMode: "contain",
  },
  brandName: {
    ...typography.textXl,
    ...typography.fontBold,
    color: palette.white,
    letterSpacing: 0.6,
  },
  brandCountry: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.white,
    letterSpacing: 3.4,
    marginTop: -3,
  },
  welcomeCopy: {
    gap: 6,
  },
  eyebrow: {
    ...typography.textLg,
    color: "rgba(255,255,255,0.72)",
  },
  returningName: {
    ...typography.text4xl,
    ...typography.fontBold,
    color: palette.white,
  },
  communityCopy: {
    ...typography.textBase,
    color: palette.white,
    marginTop: 4,
  },
  unlockSheet: {
    flex: 0.54,
    minHeight: 430,
    backgroundColor: palette.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: "center",
  },
  unlockIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.onPrimary,
    marginBottom: 16,
  },
  unlockTitle: {
    ...typography.text2xl,
    ...typography.fontBold,
    color: palette.black,
    textAlign: "center",
  },
  unlockSubtitle: {
    ...typography.textBase,
    color: palette.greyDark,
    textAlign: "center",
    maxWidth: 310,
    marginTop: 4,
    marginBottom: 22,
  },
  primaryUnlockButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryUnlockText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.white,
  },
  alternativeButton: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: palette.white,
  },
  alternativeText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.black,
    flex: 1,
    marginLeft: 12,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  trustText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(22, 12, 19, 0.45)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  methodSheet: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.greyLight,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    ...typography.textXl,
    ...typography.fontBold,
    color: palette.black,
  },
  sheetSubtitle: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 3,
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.onPrimary,
    marginRight: 12,
  },
  methodCopy: {
    flex: 1,
  },
  methodTitle: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.black,
  },
  methodSubtitle: {
    ...typography.textSm,
    color: palette.greyDark,
  },
  backToUnlock: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 6,
  },
  backToUnlockText: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
  passwordHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  passwordTitle: {
    ...typography.text2xl,
    ...typography.fontBold,
    color: palette.black,
    marginTop: 8,
  },
  passwordSubtitle: {
    ...typography.textSm,
    color: palette.greyDark,
    textAlign: "center",
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
  },
  forgotPasswordText: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
  lockedOutContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
  },
  lockedOutText: {
    ...typography.textSm,
    color: palette.greyDark,
    flex: 1,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  signUpPrompt: {
    ...typography.textBase,
    color: palette.greyDark,
  },
  signUpAction: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
});

export default SignInScreen;
