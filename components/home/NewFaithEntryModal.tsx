import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import TextField from "../form/TextField";
import { Controller, useForm } from "react-hook-form";
import Button from "../form/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAITH_CATEGORIES = ["Testimony", "Prayer Request", "Comment"];

interface IFaithEntryModal {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isLoading: boolean;
}

const NewFaithEntryModal = ({ visible, onClose, onSubmit, isLoading }: IFaithEntryModal) => {
  const insets = useSafeAreaInsets();
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
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close new faith entry"
        />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            >
            <View style={styles.header}>
              <Text style={[typography.textXl, typography.fontSemiBold, { textTransform: "capitalize" }]}>
                New Faith Entry
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close new faith entry"
              >
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <Controller
                control={control}
                name="category"
                rules={{ required: "Please choose a category" }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text style={styles.inputLabel}>
                      Category<Text style={{ color: palette.error }}>*</Text>
                    </Text>
                    <View style={styles.categoryOptions}>
                      {FAITH_CATEGORIES.map((category) => {
                        const selected = value === category;
                        return (
                          <TouchableOpacity
                            key={category}
                            style={[styles.categoryOption, selected && styles.categoryOptionSelected]}
                            onPress={() => onChange(category)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            accessibilityLabel={category}
                          >
                            <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                              {category}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {errors.category?.message ? (
                      <Text style={styles.errorText}>{String(errors.category.message)}</Text>
                    ) : null}
                  </View>
                )}
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
              <Controller
                control={control}
                name="isAnonymous"
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Switch
                      trackColor={{ false: palette.greyLight, true: palette.primary }}
                      thumbColor={palette.white}
                      ios_backgroundColor={palette.greyLight}
                      style={styles.switch}
                      onValueChange={onChange}
                      value={value}
                      accessibilityLabel="Post as anonymous"
                    />
                    <Text style={[typography.textBase, typography.fontMedium]}>Post as anonymous</Text>
                  </View>
                )}
              />

              <Button
                label={watch("category") ? `Submit ${watch("category")}` : "Submit"}
                onPress={() => handleSubmit(onSubmit)()}
                loading={isLoading}
              />
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "88%",
    backgroundColor: palette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
    marginBottom: 8,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    borderWidth: 1.5,
    borderColor: palette.greyLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryOptionSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  categoryText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
  },
  categoryTextSelected: {
    color: palette.white,
  },
  errorText: {
    ...typography.textXs,
    color: palette.error,
    marginTop: 4,
  },
  switch: { transform: [{ scaleX: 0.65 }, { scaleY: 0.6 }] },
});

export default NewFaithEntryModal;
