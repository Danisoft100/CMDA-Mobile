import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import TextField from "../form/TextField";
import SelectField from "../form/SelectField";
import { useForm } from "react-hook-form";
import Button from "../form/Button";

interface IFaithEntryModal {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isLoading: boolean;
}

const NewFaithEntryModal = ({ visible, onClose, onSubmit, isLoading }: IFaithEntryModal) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity onPress={onClose}>
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <Text style={[typography.textXl, typography.fontSemiBold, { textTransform: "capitalize" }]}>
              New Faith Entry
            </Text>

            <View style={{ gap: 16 }}>
              <SelectField
                label="category"
                placeholder="Select Category"
                options={["Testimony", "Prayer Request", "Comment"]}
                control={control}
                errors={errors}
                required
              />
              <TextField
                label="content"
                placeholder={"Enter your testimonies, prayer requests or comments"}
                control={control}
                errors={errors}
                multiline={true}
                numberOfLines={4}
                minHeight={100}
                required
              />
              <Button
                label={"Submit " + (watch("category") || "")}
                onPress={() => handleSubmit(onSubmit)()}
                loading={isLoading}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

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

export default NewFaithEntryModal;
