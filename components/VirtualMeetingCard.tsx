import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { palette, typography } from "../theme";

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
  eventDateTime?: string;
}

const VirtualMeetingCard = ({ meetingInfo, eventName, eventDateTime }: VirtualMeetingCardProps) => {
  const [showPasscode, setShowPasscode] = useState(false);
  if (!meetingInfo?.meetingLink) return null;

  const copyToClipboard = async (text: string | undefined, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Toast.show({ type: "success", text1: `${label} copied` });
  };

  const platform = meetingInfo.platform?.toLowerCase() || "";
  const platformIcon = platform.includes("zoom")
    ? "video-outline"
    : platform.includes("google")
      ? "google"
      : platform.includes("teams")
        ? "microsoft-teams"
        : platform.includes("webex")
          ? "video-wireless-outline"
          : "link-variant";
  const platformColor = platform.includes("zoom")
    ? "#2D8CFF"
    : platform.includes("google")
      ? palette.success
      : platform.includes("teams")
        ? "#5059C9"
        : palette.primary;

  const handleJoinMeeting = async () => {
    try {
      await Linking.openURL(meetingInfo.meetingLink!);
    } catch {
      Alert.alert("Meeting unavailable", "The meeting link could not be opened.");
    }
  };

  const handleAddToCalendar = async () => {
    const start = eventDateTime ? new Date(eventDateTime) : null;
    if (!start || Number.isNaN(start.getTime())) {
      Toast.show({ type: "error", text1: "Event date is unavailable" });
      return;
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatDate = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const details = [
      `Join ${eventName}`,
      meetingInfo.meetingLink,
      meetingInfo.meetingId ? `Meeting ID: ${meetingInfo.meetingId}` : "",
      meetingInfo.passcode ? `Passcode: ${meetingInfo.passcode}` : "",
    ].filter(Boolean).join("\n");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(details)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Calendar unavailable", "Copy the meeting details and add them to your calendar manually.");
    }
  };

  const DetailRow = ({ label, value, secret = false }: { label: string; value?: string; secret?: boolean }) => {
    if (!value) return null;
    const displayed = secret && !showPasscode ? "••••••" : value;
    return (
      <View style={styles.detailRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.detailLabel}>{label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.detailValue} numberOfLines={label === "Meeting Link" ? 1 : undefined}>{displayed}</Text>
            {secret ? (
              <TouchableOpacity onPress={() => setShowPasscode((current) => !current)} accessibilityRole="button" accessibilityLabel={`${showPasscode ? "Hide" : "Show"} passcode`}>
                <Text style={styles.showHideText}>{showPasscode ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <TouchableOpacity onPress={() => void copyToClipboard(value, label)} style={styles.copyButton} accessibilityRole="button" accessibilityLabel={`Copy ${label}`}>
          <MCIcon name="content-copy" size={20} color={palette.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MCIcon name={platformIcon as any} size={32} color={platformColor} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Join Virtual Meeting</Text>
          {meetingInfo.platform ? <Text style={styles.subtitle}>via {meetingInfo.platform}</Text> : null}
        </View>
      </View>

      <TouchableOpacity style={[styles.joinButton, { backgroundColor: platformColor }]} onPress={() => void handleJoinMeeting()} accessibilityRole="link" accessibilityLabel={`Join ${eventName}`}>
        <MCIcon name="video" size={20} color={palette.white} />
        <Text style={styles.joinButtonText}>Join Meeting Now</Text>
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <DetailRow label="Meeting ID" value={meetingInfo.meetingId} />
        <DetailRow label="Passcode" value={meetingInfo.passcode} secret />
        <DetailRow label="Meeting Link" value={meetingInfo.meetingLink} />
        <DetailRow label="Dial-In Numbers" value={meetingInfo.dialInNumbers} />
        {meetingInfo.additionalInstructions ? (
          <View style={styles.instructions}>
            <Text style={styles.detailLabel}>Instructions</Text>
            <Text style={styles.instructionsText}>{meetingInfo.additionalInstructions}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => void handleAddToCalendar()} accessibilityRole="button" accessibilityLabel={`Add ${eventName} to calendar`}>
          <MCIcon name="calendar-plus" size={18} color={palette.primary} />
          <Text style={styles.actionButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void copyToClipboard(meetingInfo.meetingLink, "Meeting link")} accessibilityRole="button" accessibilityLabel="Copy meeting link">
          <MCIcon name="share-variant" size={18} color={palette.primary} />
          <Text style={styles.actionButtonText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#EBF5FF", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#BFDBFE" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  title: { ...typography.textLg, ...typography.fontBold, color: palette.black },
  subtitle: { ...typography.textSm, color: palette.grey },
  joinButton: { minHeight: 50, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 16, flexDirection: "row", gap: 8 },
  joinButtonText: { ...typography.fontSemiBold, color: palette.white, fontSize: 16 },
  detailsContainer: { backgroundColor: palette.white, borderRadius: 8, paddingHorizontal: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.greyLight },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { ...typography.textXs, ...typography.fontMedium, color: palette.grey, marginBottom: 4 },
  detailValue: { flexShrink: 1, ...typography.textSm, ...typography.fontSemiBold, color: palette.black },
  showHideText: { ...typography.textXs, color: palette.primary },
  copyButton: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" },
  instructions: { paddingVertical: 12 },
  instructionsText: { ...typography.textSm, color: palette.black },
  actionButtons: { flexDirection: "row", marginTop: 16, gap: 8 },
  actionButton: { flex: 1, minHeight: 46, backgroundColor: palette.white, padding: 8, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#D1D5DB", flexDirection: "row", gap: 6 },
  actionButtonText: { ...typography.textSm, color: palette.black },
});

export default VirtualMeetingCard;
