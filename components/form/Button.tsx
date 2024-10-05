import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { palette, typography } from "~/theme";

type ButttonProps = {
  label: string;
  variant?: "filled" | "outlined";
  dense?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

const Button = ({
  label = "Button",
  variant = "filled",
  dense = false, // reduces button height
  loading = false,
  disabled = false,
  style = {}, // extra styling
  onPress = () => {},
}: ButttonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outlined" ? styles.outlined : styles.filled,
        disabled ? styles.disabled : null,
        { paddingVertical: dense ? 8 : 12, paddingHorizontal: dense ? 10 : 20 },
        { minHeight: dense ? 36 : 52 },
        !dense && { minWidth: 100 },
        style,
      ]}
      onPress={() => (disabled || loading ? () => {} : onPress())}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "filled" ? palette.white : palette.primary} />
      ) : (
        <Text
          style={[
            { fontSize: dense ? 14 : 16 },
            { color: variant === "filled" ? palette.white : palette.primary },
            typography.fontSemiBold,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  filled: {
    backgroundColor: palette.primary,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: palette.primary,
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
