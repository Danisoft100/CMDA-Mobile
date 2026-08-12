import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "~/theme";

type Props = { membershipType?: string; compact?: boolean };

const getPlanLabel = (membershipType?: string) => {
  if (!membershipType || membershipType === "lifetime") return "CMDA Nigeria";
  return `${membershipType.charAt(0).toUpperCase()}${membershipType.slice(1).toLowerCase()} membership`;
};

const LifetimeMemberStatus = ({ membershipType, compact = false }: Props) => {
  if (compact) {
    return (
      <View style={styles.compact} accessibilityLabel="Lifetime member">
        <MaterialCommunityIcons name="shield-check" size={14} color={palette.primary} />
        <Text style={[typography.textXs, typography.fontSemiBold, styles.compactText]}>Lifetime</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} accessibilityLabel={`Lifetime member, ${getPlanLabel(membershipType)}`}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="shield-check" size={22} color={palette.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[typography.textSm, typography.fontSemiBold, styles.title]}>Lifetime membership</Text>
        <Text style={[typography.textXs, styles.subtitle]}>{getPlanLabel(membershipType)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compact: {
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderColor: palette.onPrimaryContainer,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  compactText: { color: palette.primary },
  card: {
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderColor: palette.onPrimaryContainer,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  copy: { flex: 1 },
  title: { color: palette.primary },
  subtitle: { color: palette.greyDark, marginTop: 1 },
});

export default LifetimeMemberStatus;
