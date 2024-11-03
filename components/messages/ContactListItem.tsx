import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

interface ContactListItemProps {
  name?: string;
  subtext?: string;
  avatar?: string;
  onPress?: () => void;
  bordered?: boolean;
  unreadCount?: number;
}

const ContactListItem = ({
  name = "Admin",
  subtext = "---",
  avatar,
  onPress = () => {},
  bordered,
  unreadCount,
}: ContactListItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.listItem, bordered && { borderBottomWidth: 1, borderBottomColor: palette.greyLight }]}
      onPress={onPress}
    >
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.listItemAvatar} />
      ) : (
        <View style={styles.listItemIconContainer}>
          <MCIcon name="account" size={28} color={palette.black} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[typography.textBase, typography.fontSemiBold]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[typography.textSm]} numberOfLines={1}>
          {subtext}
        </Text>
      </View>
      {unreadCount ? (
        <View
          style={{
            height: 20,
            width: 20,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: palette.primary,
          }}
        >
          <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.white }]}>{unreadCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: palette.white,
  },
  listItemAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
    overflow: "hidden",
  },
  listItemIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderRadius: 24,
    height: 48,
    width: 48,
  },
});

export default ContactListItem;
