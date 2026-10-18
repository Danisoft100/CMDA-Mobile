import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";
import { palette } from "~/theme";
export default function QueryFeedback({
  loading,
  error,
  empty,
  onRetry,
  label = "items",
}: {
  loading?: boolean;
  error?: any;
  empty?: boolean;
  onRetry?: () => any;
  label?: string;
}) {
  if (error)
    return (
      <View
        accessibilityLiveRegion="polite"
        style={{
          padding: 16,
          gap: 8,
          borderRadius: 12,
          backgroundColor: "#fff2f0",
        }}
      >
        <Text style={{ color: "#9b2c20" }}>
          {getApiErrorMessage(
            error,
            `We couldn’t load ${label}. Please try again.`,
          )}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Retry loading ${label}`}
          onPress={onRetry}
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={{ color: palette.primary, fontWeight: "600" }}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  if (loading)
    return (
      <View
        accessibilityLiveRegion="polite"
        style={{ padding: 24, gap: 10, alignItems: "center" }}
      >
        <ActivityIndicator color={palette.primary} />
        <Text>Loading {label}…</Text>
      </View>
    );
  if (empty)
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={{ padding: 24, textAlign: "center", color: "#59665f" }}
      >
        No matching {label} to display.
      </Text>
    );
  return null;
}
