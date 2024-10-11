import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { palette, typography } from "~/theme";

type MProps = {
  type: "sender" | "receiver"; // Define a more specific type for clarity
  message: string;
  timestamp: string;
};

const MessageCard = ({ type, message, timestamp }: MProps) => (
  <View style={styles.messageContainer}>
    <View style={[styles.messageCard, type === "sender" ? styles.sender : styles.receiver]}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
    {/* Timestamp */}
    <Text style={[styles.timeStamp, type === "sender" ? styles.senderTimeStamp : styles.receiverTimeStamp]}>
      {timestamp}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 10,
  },
  messageCard: {
    color: palette.black,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "75%",
  },
  sender: {
    backgroundColor: palette.onPrimaryContainer,
    borderTopRightRadius: 0,
    alignSelf: "flex-end",
  },
  receiver: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 0,
    alignSelf: "flex-start",
  },
  messageText: {
    ...typography.textBase,
    ...typography.fontMedium,
  },
  timeStamp: {
    fontSize: 12,
    color: palette.grey,
    marginTop: 4,
  },
  senderTimeStamp: {
    alignSelf: "flex-end", // Aligns timestamp to the right for sender
  },
  receiverTimeStamp: {
    alignSelf: "flex-start", // Aligns timestamp to the left for receiver
  },
});

export default MessageCard;
