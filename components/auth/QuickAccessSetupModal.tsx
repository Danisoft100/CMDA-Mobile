import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { palette, typography } from "~/theme";

type Props = {
  visible: boolean;
  biometricAvailable: boolean;
  biometricLabel: string;
  biometricIcon: keyof typeof MaterialIcons.glyphMap;
  biometricLoading: boolean;
  onBiometric: () => void;
  onPIN: () => void;
  onSkip: () => void;
};

const QuickAccessSetupModal = ({
  visible,
  biometricAvailable,
  biometricLabel,
  biometricIcon,
  biometricLoading,
  onBiometric,
  onPIN,
  onSkip,
}: Props) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onSkip}>
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="verified-user" size={42} color={palette.primary} />
      </View>
      <Text style={styles.title}>Set up quick access</Text>
      <Text style={styles.subtitle}>
        Choose how you want to unlock CMDA the next time your session expires. Your password remains available.
      </Text>

      {biometricAvailable ? (
        <TouchableOpacity
          style={styles.primaryOption}
          onPress={onBiometric}
          disabled={biometricLoading}
          accessibilityRole="button"
        >
          {biometricLoading ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <MaterialIcons name={biometricIcon} size={26} color={palette.white} />
          )}
          <View style={styles.optionCopy}>
            <Text style={styles.primaryTitle}>Use {biometricLabel}</Text>
            <Text style={styles.primarySubtitle}>Fast and protected by this device</Text>
          </View>
          {!biometricLoading ? <MaterialIcons name="chevron-right" size={24} color={palette.white} /> : null}
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.secondaryOption} onPress={onPIN} accessibilityRole="button">
        <View style={styles.secondaryIcon}>
          <MaterialIcons name="dialpad" size={25} color={palette.primary} />
        </View>
        <View style={styles.optionCopy}>
          <Text style={styles.secondaryTitle}>Create a CMDA PIN</Text>
          <Text style={styles.secondarySubtitle}>Use a secure 4–6 digit PIN</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={palette.grey} />
      </TouchableOpacity>

      <View style={styles.reassurance}>
        <MaterialIcons name="lock-outline" size={18} color={palette.secondary} />
        <Text style={styles.reassuranceText}>Quick-access details are protected on this device.</Text>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} accessibilityRole="button">
        <Text style={styles.skipText}>Maybe later</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 24,
    paddingTop: 54,
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: palette.onPrimary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    ...typography.text2xl,
    ...typography.fontBold,
    color: palette.black,
    textAlign: "center",
  },
  subtitle: {
    ...typography.textBase,
    color: palette.greyDark,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 30,
  },
  primaryOption: {
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: palette.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  secondaryOption: {
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: palette.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  secondaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.onPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionCopy: { flex: 1, marginLeft: 12 },
  primaryTitle: { ...typography.textBase, ...typography.fontSemiBold, color: palette.white },
  primarySubtitle: { ...typography.textSm, color: "rgba(255,255,255,0.78)", marginTop: 2 },
  secondaryTitle: { ...typography.textBase, ...typography.fontSemiBold, color: palette.black },
  secondarySubtitle: { ...typography.textSm, color: palette.greyDark, marginTop: 2 },
  reassurance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 22,
  },
  reassuranceText: { ...typography.textSm, color: palette.secondary, flexShrink: 1 },
  skipButton: { alignSelf: "center", paddingHorizontal: 20, paddingVertical: 16, marginTop: 10 },
  skipText: { ...typography.textBase, ...typography.fontSemiBold, color: palette.primary },
});

export default QuickAccessSetupModal;
