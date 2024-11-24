import React, { MutableRefObject, useRef, useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Controller } from "react-hook-form";
import FormError from "./FormError";
import capitalizeWords from "~/utils/capitalizeWords";
import { palette, typography } from "~/theme";

type TextFieldProps = {
  control: any;
  label: string;
  type?: "password" | "email" | any;
  title?: string;
  rules?: any;
  placeholder?: string;
  errors: any;
  showLabel?: boolean;
  required?: boolean | string;
  keyboardType?: KeyboardTypeOptions;
  icon?: any;
  disabled?: boolean;
  numberOfLines?: number;
  minHeight?: number;
  multiline?: boolean;
  iconPress?: () => void;
  onPressIn?: () => void;
  onChangeFn?: (d: any) => void;
};

const TextField = ({
  control,
  label,
  rules,
  placeholder,
  errors,
  type,
  showLabel = true,
  title,
  required,
  keyboardType = "default",
  numberOfLines = 1,
  icon,
  disabled,
  minHeight = 52,
  multiline,
  iconPress = () => {},
  onPressIn = () => {},
  onChangeFn,
}: TextFieldProps) => {
  const [showPwd, setShowPwd] = useState(false);

  const scrollViewRef = useRef(null);
  const inputRefs = { [label]: useRef(null) };

  const handleFocus = (inputRef: MutableRefObject<any>) => {
    if (scrollViewRef.current && inputRef && inputRef.current) {
      inputRef.current.measureLayout((scrollViewRef.current as any).getInnerViewNode(), (_: any, y: any) => {
        (scrollViewRef?.current as any).scrollTo({ y, animated: true });
      });
    }
  };

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
            <TextInput
              ref={inputRefs[label]}
              onFocus={() => handleFocus(inputRefs[label])}
              style={[styles.input, { minHeight }, icon && { paddingLeft: 42 }]}
              secureTextEntry={type === "password" && !showPwd}
              placeholder={placeholder}
              keyboardType={type === "email" ? "email-address" : keyboardType}
              autoCapitalize="none"
              onBlur={onBlur}
              multiline={multiline}
              numberOfLines={numberOfLines}
              onChangeText={(d) => {
                onChange(d);
                if(onChangeFn) onChangeFn(d);
              }}
              readOnly={disabled}
              value={value}
              onPressIn={onPressIn}
            />
          )}
        />
        {icon && (
          <MCIcon name={icon} color={palette.primary} size={20} style={styles.inputLeftIcon} onPress={iconPress} />
        )}
        {type === "password" && (
          <MCIcon
            name={showPwd ? "eye-off" : "eye"}
            onPress={() => setShowPwd(!showPwd)}
            color={palette.primary}
            size={20}
            style={styles.inputRightIcon}
          />
        )}
        <FormError error={errors?.[label]?.message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: palette.white,
    paddingHorizontal: 12,
    borderRadius: 8,
    paddingVertical: 8,
    color: palette.black,
    ...typography.textBase,
    lineHeight: typography.textBase.lineHeight - 4,
    borderWidth: 1.5,
    borderColor: palette.greyLight,
  },
  inputLeftIcon: { position: "absolute", left: 16, top: 14 },
  inputRightIcon: { position: "absolute", right: 16, top: 14 },
  inputLabel: {
    marginBottom: 4,
    ...typography.textSm,
    color: palette.black,
    ...typography.fontMedium,
  },
});

export default TextField;
