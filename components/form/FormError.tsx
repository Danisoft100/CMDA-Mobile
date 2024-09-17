import React from "react";
import { StyleSheet, Text } from "react-native";
import { palette, typography } from "~/theme";

const FormError = ({ error }: { error: string }) => {
  return error ? <Text style={styles.error}>{error}</Text> : null;
};

const styles = StyleSheet.create({
  error: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.error,
    marginVertical: 4,
    paddingHorizontal: 8,
  },
});

export default FormError;
