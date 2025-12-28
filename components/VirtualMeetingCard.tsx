import { useState } from "react";
import { View, Text, TouchableOpacity, Linking, Alert, StyleSheet } from "react-native";
import { palette, typography } from "../theme";
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

interface VirtualMeetingCardProps {
  meetingInfo: {
    meetingLink?: string;
    platform?: string;
    meetingId?: string;
    passcode?: string;
    dialInNumbers?: string;
    additionalInstructions?: string;
  };
  eventName: string;
}

const VirtualMeetingCard = ({ meetingInfo, eventName }: VirtualMeetingCardProps) => {
  const [showPasscode, setShowPasscode] = useState(false);

  if (!meetingInfo || !meetingInfo.meetingLink) return null;

  const copyToClipboard = async (text: string | undefined, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Toast.show({ type: "success", text1: `${label} copied` });
  };

  const getPlatformEmoji = (platform: string | undefined) => {
    const platformLower = platform?.toLowerCase() || "";
    if (platformLower.includes("zoom")) return "📹";
    if (platformLower.includes("google")) return "📞";
    if (platformLower.includes("teams")) return "💼";
    if (platformLower.includes("webex")) return "🎥";
    return "🔗";
  };

  const getPlatformColor = (platform: string | undefined) => {
    const platformLower = platform?.toLowerCase() || "";
    if (platformLower.includes("zoom")) return "#2D8CFF";
    if (platformLower.includes("google")) return palette.success;
    if (platformLower.includes("teams")) return "#5059C9";
    return palette.primary;
  };

  const handleJoinMeeting = () => {
    if (!meetingInfo.meetingLink) return;
    Linking.openURL(meetingInfo.meetingLink).catch(() => {
      Alert.alert("Error", "Could not open meeting link");
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{getPlatformEmoji(meetingInfo.platform)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Join Virtual Meeting</Text>
          {meetingInfo.platform && (
            <Text style={styles.subtitle}>via {meetingInfo.platform}</Text>
          )}
        </View>
      </View>

      {/* Join Button */}
      <TouchableOpacity
        style={[styles.joinButton, { backgroundColor: getPlatformColor(meetingInfo.platform) }]}
        onPress={handleJoinMeeting}
      >
        <Text style={styles.joinButtonText}>🚀 Join Meeting Now</Text>
      </TouchableOpacity>

      {/* Meeting Details */}
      <View style={styles.detailsContainer}>
        {meetingInfo.meetingId && (
          <View style={styles.detailRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Meeting ID</Text>
              <Text style={styles.detailValue}>{meetingInfo.meetingId}</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(meetingInfo.meetingId, "Meeting ID")}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>
        )}

        {meetingInfo.passcode && (
          <View style={[styles.detailRow, styles.borderTop]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Passcode</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.detailValue}>
                  {showPasscode ? meetingInfo.passcode : "••••••"}
                </Text>
                <TouchableOpacity onPress={() => setShowPasscode(!showPasscode)}>
                  <Text style={styles.showHideText}>{showPasscode ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(meetingInfo.passcode, "Passcode")}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>
        )}

        {meetingInfo.meetingLink && (
          <View style={[styles.detailRow, styles.borderTop]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Meeting Link</Text>
              <Text style={styles.linkText} numberOfLines={1}>
                {meetingInfo.meetingLink}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(meetingInfo.meetingLink, "Link")}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>📋</Text>
            </TouchableOpacity>
          </View>
        )}

        {meetingInfo.dialInNumbers && (
          <View style={[styles.detailRow, styles.borderTop]}>
            <View>
              <Text style={styles.detailLabel}>Dial-In Numbers</Text>
              <Text style={styles.detailValue}>{meetingInfo.dialInNumbers}</Text>
            </View>
          </View>
        )}

        {meetingInfo.additionalInstructions && (
          <View style={[styles.detailRow, styles.borderTop]}>
            <View>
              <Text style={styles.detailLabel}>Instructions</Text>
              <Text style={styles.detailValue}>{meetingInfo.additionalInstructions}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Toast.show({ type: "info", text1: "Add to calendar coming soon" })}
        >
          <Text style={styles.actionButtonText}>📅 Add to Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyToClipboard(meetingInfo.meetingLink, "Meeting details")}
        >
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EBF5FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.black,
  },
  subtitle: {
    ...typography.textSm,
    color: palette.grey,
  },
  joinButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  joinButtonText: {
    ...typography.fontSemiBold,
    color: palette.white,
    fontSize: 16,
  },
  detailsContainer: {
    backgroundColor: palette.white,
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 12,
  },
  detailLabel: {
    ...typography.textXs,
    ...typography.fontMedium,
    color: palette.grey,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.black,
    fontFamily: "monospace",
  },
  linkText: {
    ...typography.textXs,
    color: "#2D8CFF",
  },
  copyButton: {
    padding: 8,
  },
  copyButtonText: {
    fontSize: 20,
  },
  showHideText: {
    ...typography.textXs,
    color: "#2D8CFF",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: palette.white,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  actionButtonText: {
    ...typography.textSm,
    color: palette.black,
  },
});

export default VirtualMeetingCard;
