import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout, selectAuth, setAccessToken } from "~/store/slices/authSlice";
import { palette, typography } from "~/theme";
import TokenManager from "~/services/TokenManager";
import BiometricService from "~/services/BiometricService";
import PINManager from "~/services/PINManager";

const SplashScreen = ({ navigation }: any) => {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const timer = setTimeout(async () => {
        const shouldReturnToSignIn = async () => {
          const [hasSignedInBefore, biometricEnabled, pinEnabled] = await Promise.all([
            TokenManager.hasSignedInBefore(),
            BiometricService.isBiometricEnabled(),
            PINManager.isPINEnabled(),
          ]);
          return hasSignedInBefore || biometricEnabled || pinEnabled;
        };

        try {
          // Restore session from secure storage even if Redux rehydrate is slow/partial
          let token = await TokenManager.getToken();
          if (!token) {
            token = await TokenManager.refreshToken();
          }

          if (cancelled) return;

          if (!token) {
            if (isAuthenticated) dispatch(logout());
            navigation.replace((await shouldReturnToSignIn()) ? "sign-in" : "onboarding");
            return;
          }

          dispatch(setAccessToken(token));

          if (user?.emailVerified || isAuthenticated) {
            if (user && !user.emailVerified) {
              navigation.replace("verify", { email: user.email });
            } else {
              navigation.replace("tab");
            }
            return;
          }

          // Token exists but Redux user missing — still allow in; tabs will load profile
          navigation.replace("tab");
        } catch {
          if (!cancelled) {
            navigation.replace((await shouldReturnToSignIn()) ? "sign-in" : "onboarding");
          }
        }
      }, 300);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, [dispatch, isAuthenticated, navigation, user])
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View
          style={{ flexDirection: "row", width: Platform.OS === "ios" ? "60%" : "75%", gap: 6, alignItems: "center" }}
        >
          <Image source={require("~/assets/CMDALOGO_white.png")} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.textSm, typography.fontBold, { color: palette.white }]}>
              CHRISTIAN MEDICAL AND DENTAL ASSOCIATION OF NIGERIA
            </Text>
            <Text style={[[typography.textSm, typography.fontNormal, { color: palette.white }]]}>(CMDA NIGERIA)</Text>
          </View>
        </View>
        <ActivityIndicator color={palette.white} style={styles.loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.primary,
  },
  container: {
    flex: 0.6,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { height: 88, width: 50 },
  loading: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
});

export default SplashScreen;
