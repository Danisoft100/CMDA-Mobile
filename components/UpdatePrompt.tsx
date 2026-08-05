import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

interface UpdatePromptProps {
  visible: boolean;
  onUpdateNow: () => void;
  onLater: () => void;
  isLoading?: boolean;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ visible, onUpdateNow, onLater, isLoading }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MCIcon name="download-circle" size={56} color={palette.primary} />
          </View>

          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.subtitle}>
            A new version of CMDA Nigeria is ready with improvements and bug fixes.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <FontAwesome6 name="check-circle" size={16} color={palette.success} />
              <Text style={styles.featureText}>Performance improvements</Text>
            </View>
            <View style={styles.featureRow}>
              <FontAwesome6 name="check-circle" size={16} color={palette.success} />
              <Text style={styles.featureText}>Bug fixes</Text>
            </View>
            <View style={styles.featureRow}>
              <FontAwesome6 name="check-circle" size={16} color={palette.success} />
              <Text style={styles.featureText}>New features</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onUpdateNow}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {isLoading ? "Updating..." : "Update Now"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onLater}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Later</Text>
          </TouchableOpacity>

          <Text style={styles.note}>The update will be applied on next restart</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    ...typography.textXl,
    ...typography.fontBold,
    color: palette.black,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    ...typography.textBase,
    color: palette.grey,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  features: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: palette.white,
    ...typography.fontSemiBold,
  },
  secondaryButton: {
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  secondaryButtonText: {
    color: palette.black,
    ...typography.fontMedium,
  },
  buttonText: {
    ...typography.textBase,
  },
  note: {
    ...typography.textXs,
    color: palette.grey,
    marginTop: 4,
  },
});

export default UpdatePrompt;
