import { Text, TouchableOpacity, View, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
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
import BiometricService, { BiometricType } from "~/services/BiometricService";
import PINManager from "~/services/PINManager";
import { PINSetupModal } from "~/components/auth";
import { useTutorial } from "~/contexts/TutorialContext";
import OnboardingTutorialService from "~/services/OnboardingTutorialService";
import PushNotificationService from "~/services/PushNotificationService";

const SignInScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const { start: startTutorial, isCompleted: tutorialCompleted } = useTutorial();
  
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<BiometricType[]>([]);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  
  // PIN state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [isPinLockedOut, setIsPinLockedOut] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ user: any; email: string; accessToken: string } | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
    checkPinAvailability();
  }, []);

  useEffect(() => {
    if (biometricEnabled && !isLockedOut) {
      const timer = setTimeout(() => {
        handleBiometricLogin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [biometricEnabled, isLockedOut]);

  const checkPinAvailability = async () => {
    try {
      const enabled = await PINManager.isPINEnabled();
      const lockedOut = await PINManager.isLockedOut();
      
      setPinEnabled(enabled);
      setIsPinLockedOut(lockedOut);
    } catch (error) {
      console.error('[SignInScreen] Error checking PIN:', error);
    }
  };


  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isAvailable();
      const enabled = await BiometricService.isBiometricEnabled();
      const types = await BiometricService.getSupportedTypes();
      const lockedOut = await BiometricService.isLockedOut();
      
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricTypes(types);
      setIsLockedOut(lockedOut);
    } catch (error) {
      console.error('[SignInScreen] Error checking biometric:', error);
    }
  };

  const getBiometricButtonLabel = useCallback((): string => {
    if (biometricTypes.includes('faceId')) {
      return 'Use Face ID';
    } else if (biometricTypes.includes('fingerprint')) {
      return 'Use Fingerprint';
    } else if (biometricTypes.includes('iris')) {
      return 'Use Iris';
    }
    return 'Use Biometric';
  }, [biometricTypes]);

  const getBiometricIcon = useCallback((): keyof typeof MaterialIcons.glyphMap => {
    if (biometricTypes.includes('faceId')) {
      return 'face';
    }
    return 'fingerprint';
  }, [biometricTypes]);

  const handleBiometricLogin = async () => {
    if (biometricLoading) return;
    
    setBiometricLoading(true);
    try {
      const credentials = await BiometricService.biometricLogin();
      
      if (!credentials) {
        const lockedOut = await BiometricService.isLockedOut();
        setIsLockedOut(lockedOut);
        
        if (lockedOut) {
          Toast.show({ 
            type: "error", 
            text1: "Biometric Locked",
            text2: "Too many failed attempts. Please use your password."
          });
          setBiometricEnabled(false);
        } else {
          Toast.show({ 
            type: "error", 
            text1: "Authentication failed",
            text2: "Please try again or use your password"
          });
        }
        return;
      }

      loginUser({ email: credentials.email, useBiometric: true, biometricToken: credentials.biometricToken })
        .unwrap()
        .then((res: any) => {
          Toast.show({ type: "success", text1: "Login successful" });
          const { user, accessToken } = res.data;
          dispatch(setUser({ user, accessToken }));
          BiometricService.resetFailedAttempts();
          
          if (user.emailVerified) {
            navigation.navigate("tab");
          } else {
            navigation.navigate("verify", { email: credentials.email });
          }
        })
        .catch(() => {
          Toast.show({ 
            type: "error", 
            text1: "Login failed",
            text2: "Please use your password to login"
          });
        });
    } catch (error) {
      console.error('[SignInScreen] Biometric login error:', error);
      Toast.show({ 
        type: "error", 
        text1: "Error",
        text2: "Biometric authentication failed"
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  // Handle PIN login
  const handlePinLogin = async () => {
    navigation.navigate('pin-entry', {
      mode: 'login',
      onSuccess: async (pin: string) => {
        setPinLoading(true);
        try {
          const credentials = await PINManager.validatePIN(pin);
          
          if (!credentials) {
            const lockedOut = await PINManager.isLockedOut();
            setIsPinLockedOut(lockedOut);
            
            if (lockedOut) {
              Toast.show({ 
                type: "error", 
                text1: "PIN Locked",
                text2: "Too many failed attempts. Please use your password."
              });
              setPinEnabled(false);
            } else {
              const remaining = await PINManager.getRemainingAttempts();
              Toast.show({ 
                type: "error", 
                text1: "Incorrect PIN",
                text2: `${remaining} attempts remaining`
              });
            }
            navigation.goBack();
            return;
          }

          // Login with stored credentials
          loginUser({ email: credentials.email, usePIN: true, pinToken: credentials.pinToken })
            .unwrap()
            .then((res: any) => {
              Toast.show({ type: "success", text1: "Login successful" });
              const { user, accessToken } = res.data;
              dispatch(setUser({ user, accessToken }));
              PINManager.resetFailedAttempts();
              
              if (user.emailVerified) {
                navigation.navigate("tab");
              } else {
                navigation.navigate("verify", { email: credentials.email });
              }
            })
            .catch(() => {
              Toast.show({ 
                type: "error", 
                text1: "Login failed",
                text2: "Please use your password to login"
              });
              navigation.goBack();
            });
        } catch (error) {
          console.error('[SignInScreen] PIN login error:', error);
          Toast.show({ 
            type: "error", 
            text1: "Error",
            text2: "PIN authentication failed"
          });
          navigation.goBack();
        } finally {
          setPinLoading(false);
        }
      },
      onCancel: () => {
        navigation.goBack();
      },
    });
  };


  const handleSignIn = (payload: any) => {
    loginUser(payload)
      .unwrap()
      .then(async (res: any) => {
        Toast.show({ type: "success", text1: "Login successful" });
        const { user, accessToken } = res.data;
        dispatch(setUser({ user, accessToken }));

        await BiometricService.resetFailedAttempts();
        await PINManager.resetFailedAttempts();
        setIsLockedOut(false);
        setIsPinLockedOut(false);

        // Store credentials for PIN/biometric authentication
        await PINManager.storeCredentials(payload.email, accessToken);

        // Check if we should offer biometric or PIN setup
        const shouldOfferBiometric = biometricAvailable && !biometricEnabled;
        const shouldOfferPIN = !pinEnabled && !shouldOfferBiometric;

        if (shouldOfferBiometric) {
          const typeNames = BiometricService.getBiometricTypeNames(biometricTypes);
          Alert.alert(
            "Enable Biometric Login",
            `Would you like to enable ${typeNames.join(' or ')} login for faster access?`,
            [
              {
                text: "Not Now",
                style: "cancel",
                onPress: () => offerPINSetup(user, payload.email, accessToken),
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
                  navigateAfterLogin(user, payload.email);
                },
              },
            ]
          );
        } else if (shouldOfferPIN) {
          offerPINSetup(user, payload.email, accessToken);
        } else {
          navigateAfterLogin(user, payload.email);
        }
      })
      .catch((error) => {
        const message = error?.data?.message;
        if (message && message.includes("not verified")) {
          navigation.navigate("verify", { email: payload.email });
        }
      });
  };

  // Offer PIN setup after successful login
  const offerPINSetup = (user: any, email: string, accessToken: string) => {
    Alert.alert(
      "Enable PIN Login",
      "Would you like to set up a PIN for faster access?",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => navigateAfterLogin(user, email),
        },
        {
          text: "Set Up PIN",
          onPress: () => {
            setPendingLoginData({ user, email, accessToken });
            setShowPinSetupModal(true);
          },
        },
      ]
    );
  };

  // Handle PIN setup success
  const handlePinSetupSuccess = () => {
    setPinEnabled(true);
    Toast.show({ 
      type: "success", 
      text1: "PIN login enabled" 
    });
    
    if (pendingLoginData) {
      navigateAfterLogin(pendingLoginData.user, pendingLoginData.email);
      setPendingLoginData(null);
    }
  };

  // Handle PIN setup modal close
  const handlePinSetupClose = () => {
    setShowPinSetupModal(false);
    if (pendingLoginData) {
      navigateAfterLogin(pendingLoginData.user, pendingLoginData.email);
      setPendingLoginData(null);
    }
  };

  const navigateAfterLogin = async (user: any, email: string) => {
    // Register push token on login
    // Requirements: 7.1 - Register device's push token with the backend on login
    try {
      await PushNotificationService.registerPushTokenOnLogin();
    } catch (error) {
      console.error('[SignInScreen] Failed to register push token:', error);
      // Don't block login if push token registration fails
    }

    if (user.emailVerified) {
      navigation.navigate("tab");
      
      // Check if tutorial should be shown for new users
      // Requirements: 4.1 - Auto-start tutorial after registration
      const shouldShowTutorial = await OnboardingTutorialService.shouldShowTutorial();
      if (shouldShowTutorial) {
        // Small delay to allow navigation to complete
        setTimeout(() => {
          startTutorial();
        }, 500);
      }
    } else {
      navigation.navigate("verify", { email });
    }
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

      {biometricAvailable && biometricEnabled && !isLockedOut && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={biometricLoading}
        >
          <MaterialIcons 
            name={getBiometricIcon()} 
            size={24} 
            color={palette.primary} 
          />
          <Text style={[typography.textBase, typography.fontSemiBold, styles.biometricButtonText]}>
            {biometricLoading ? 'Authenticating...' : getBiometricButtonLabel()}
          </Text>
        </TouchableOpacity>
      )}

      {pinEnabled && !isPinLockedOut && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handlePinLogin}
          disabled={pinLoading}
        >
          <MaterialIcons 
            name="dialpad" 
            size={24} 
            color={palette.primary} 
          />
          <Text style={[typography.textBase, typography.fontSemiBold, styles.biometricButtonText]}>
            {pinLoading ? 'Authenticating...' : 'Use PIN'}
          </Text>
        </TouchableOpacity>
      )}

      {isLockedOut && (
        <View style={styles.lockedOutContainer}>
          <MaterialIcons name="lock" size={20} color="#dc2626" />
          <Text style={[typography.textSm, styles.lockedOutText]}>
            Biometric login is temporarily disabled. Please use your password.
          </Text>
        </View>
      )}

      {isPinLockedOut && (
        <View style={styles.lockedOutContainer}>
          <MaterialIcons name="lock" size={20} color="#dc2626" />
          <Text style={[typography.textSm, styles.lockedOutText]}>
            PIN login is temporarily disabled. Please use your password.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row" }}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginRight: 4 }]}>
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-up")}>
          <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* PIN Setup Modal */}
      <PINSetupModal
        visible={showPinSetupModal}
        onClose={handlePinSetupClose}
        onSuccess={handlePinSetupSuccess}
        mode="setup"
      />
    </AppKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  biometricButtonText: {
    color: palette.primary,
    marginLeft: 8,
  },
  lockedOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  lockedOutText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
});

export default SignInScreen;
