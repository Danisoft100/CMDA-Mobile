import React from "react";
import { Modal, StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";

interface IDevotionalModal {
  visible: boolean;
  onClose: () => void;
  devotional?: any;
}

const DevotionalModal = ({ visible, onClose, devotional = {} }: IDevotionalModal) => {
  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <TouchableWithoutFeedback style={styles.modalContainer}>
          <View style={styles.modalContainer}>
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity onPress={onClose}>
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <Text style={[typography.textXl, typography.fontSemiBold, { textTransform: "capitalize" }]}>
              {devotional?.title}
            </Text>

            <Text style={[typography.textBase]}>{devotional?.content}</Text>

            <Text style={[typography.textBase, { marginTop: 12 }]}>
              <Text style={[typography.fontMedium]}>PRAYER POINT:</Text> {devotional?.prayerPoints}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
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
    minHeight: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
});
