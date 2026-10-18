import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";

interface IDevotionalModal {
  visible: boolean;
  onClose: () => void;
  devotional?: any;
}

const DevotionalModal = ({
  visible,
  onClose,
  devotional = {},
}: IDevotionalModal) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss devotional"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View accessibilityViewIsModal style={styles.modalContainer}>
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close devotional"
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={onClose}
            >
              <MCIcon name="close" size={28} color={palette.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            <Text
              style={[
                typography.textXl,
                typography.fontSemiBold,
                { textTransform: "capitalize" },
              ]}
            >
              {devotional?.title}
            </Text>

            <Text style={[typography.textBase]}>{devotional?.content}</Text>

            <Text style={[typography.textBase, { marginTop: 12 }]}>
              <Text style={[typography.fontMedium]}>PRAYER POINT:</Text>{" "}
              {devotional?.prayerPoints}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DevotionalModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    maxHeight: "85%",
    minHeight: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
});
