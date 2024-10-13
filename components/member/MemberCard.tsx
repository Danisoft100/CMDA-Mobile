import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { palette, typography } from "~/theme";

const MemberCard = ({ width = 256, fullName, id, memId, navigation, avatar, role, region, style = {} }: any) => {
  const backgroundColor: any = {
    Student: palette.onPrimary,
    Doctor: palette.onSecondary,
    GlobalNetwork: palette.onTertiary,
  };

  const textColor: any = {
    Student: palette.primary,
    Doctor: palette.secondary,
    GlobalNetwork: palette.tertiary,
  };

  return (
    <View style={[styles.card, { width }, style]}>
      {avatar ? (
        <Image style={[styles.avatar]} source={{ uri: avatar }} resizeMode="cover" />
      ) : (
        <View style={styles.iconContainer}>
          <MCIcon
            name="account"
            size={60}
            color={textColor[role]}
            style={[{ backgroundColor: backgroundColor[role] }, styles.icon]}
          />
        </View>
      )}

      <View style={[styles.textContainer, { gap: 8 }]}>
        <Text style={[typography.textBase, typography.fontSemiBold]} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={[styles.role, { backgroundColor: backgroundColor[role], color: textColor[role] }]}>
          {capitalizeWords(role)}
        </Text>
        <Text style={[typography.textSm, typography.fontNormal]} numberOfLines={1}>
          {region}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate("home-members-single", { id: memId })}
          style={styles.actionButton}
        >
          <MCIcon name="eye-outline" size={20} color={palette.primary} />
        </TouchableOpacity>

        <View style={styles.border} />

        <TouchableOpacity
          onPress={() => navigation.navigate("home-messages-single", { id, fullName })}
          style={styles.actionButton}
        >
          <MCIcon name="message-text-outline" size={20} color={palette.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingTop: 16,
    borderColor: palette.greyLight,
    borderWidth: 1,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    borderRadius: 40,
    textAlign: "center",
    overflow: "hidden",
    padding: 10,
  },
  textContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 8,
  },
  role: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 4,
    textAlign: "center",
    ...typography.textXs,
    ...typography.fontSemiBold,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: palette.greyLight,
    width: "100%",
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 32,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    width: 1,
    backgroundColor: palette.greyLight,
  },
});

export default MemberCard;
