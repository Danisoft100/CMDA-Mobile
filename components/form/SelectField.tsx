import React from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { palette, typography } from "~/theme";
import capitalizeWords from "~/utils/capitalizeWords";
import FormError from "./FormError";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

type SelectFieldProps = {
  control: any;
  label: string;
  title?: string;
  rules?: any;
  placeholder?: string;
  options: string[] | { label: string; value: any }[];
  errors: any;
  showLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  onSelect?: any;
};

const SelectField = ({
  showLabel = true,
  required,
  control,
  label,
  title,
  rules,
  errors,
  disabled,
  placeholder = "Select an option",
  options = [],
  onSelect,
}: SelectFieldProps) => {
  return (
    <View style={{ width: "100%" }}>
      {showLabel && (
        <Text style={styles.inputLabel}>
          {title || capitalizeWords(label)}
          {required ? <Text style={{ color: palette.error }}>*</Text> : null}
        </Text>
      )}
      <View style={{ position: "relative" }}>
        <Controller
          control={control}
          name={label}
          rules={{
            required: required ? (typeof required === "string" ? required : "This field is required") : false,
            ...rules,
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <RNPickerSelect
              value={value}
              onValueChange={(v) => {
                onChange(v);
                if (onSelect) onSelect(v);
              }}
              items={options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt))}
              style={{
                inputIOSContainer: styles.input,
                inputAndroidContainer: styles.input,
                placeholder: styles.placeholder,
                inputAndroid: styles.inputText,
                inputIOS: styles.inputText,
              }}
              useNativeAndroidPickerStyle={false}
              placeholder={{ label: placeholder, value: null }}
              Icon={(props: any) => <MCIcon name="menu-down" color={palette.black} size={28} {...props} />}
              disabled={disabled}
              onClose={onBlur}
            />
          )}
        />
        <FormError error={errors?.[label]?.message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: palette.white,
    paddingHorizontal: 8,
    borderRadius: 8,
    paddingVertical: 8,
    color: palette.black,
    ...typography.textBase,
    lineHeight: typography.textBase.lineHeight - 4,
    borderWidth: 1.5,
    borderColor: palette.greyLight,
    justifyContent: "center",
    minHeight: 52,
  },
  placeholder: {
    ...typography.textBase,
    lineHeight: typography.textLg.lineHeight - 4,
    color: palette.grey,
  },
  inputText: { ...typography.textBase, lineHeight: typography.textLg.lineHeight - 4, color: palette.black },
  inputLabel: {
    marginBottom: 4,
    ...typography.textSm,
    color: palette.black,
    ...typography.fontMedium,
  },
});

export default SelectField;
