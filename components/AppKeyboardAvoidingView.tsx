import React, { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "~/theme";

interface Props extends PropsWithChildren {
  withScrollView?: boolean;
  backgroundColor?: string;
  offSet?: number;
  padding?: number;
  gap?: number;
}

const AppKeyboardAvoidingView = ({
  withScrollView = true,
  backgroundColor = palette.background,
  children,
  offSet,
  padding = 16,
  gap = 16,
}: Props) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor }}
      keyboardVerticalOffset={offSet ?? Platform.OS === "ios" ? 64 + useSafeAreaInsets().bottom : 0}
    >
      {withScrollView ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding, gap }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
};

export default AppKeyboardAvoidingView;
