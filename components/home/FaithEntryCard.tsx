import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { faithBackgroundColor, faithTextColor } from "~/constants/roleColor";

interface FaithCardProps {
  category: string;
  user: any;
  content: string;
  createdAt: string;
  style?: any;
  truncate?: boolean;
}

const FaithEntryCard = ({ category, user, content, createdAt, style, truncate }: FaithCardProps) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={[styles.type, { backgroundColor: faithBackgroundColor[category], color: faithTextColor[category] }]}>
        {category}
      </Text>
      <Text
        style={[typography.textBase, typography.fontMedium, { marginBottom: 8 }]}
        numberOfLines={truncate ? 2 : undefined}
      >
        {content}
      </Text>
      <View style={{ flexDirection: "row", gap: 2, marginBottom: 2 }}>
        <Text style={styles.label}>Posted by:</Text>
        <Text style={styles.value}>{user?.fullName || "Anonymous"}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 2 }}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{formatDate(createdAt).date + " || " + formatDate(createdAt).time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...typography.textSm,
    ...typography.fontSemiBold,
    borderRadius: 12,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  label: { ...typography.textSm, color: palette.grey },
  value: { ...typography.textSm, ...typography.fontMedium, color: palette.black },
});

export default FaithEntryCard;
