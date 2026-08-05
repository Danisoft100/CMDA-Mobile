import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import {
  useGetEventRemindersQuery,
  useDeleteEventReminderMutation,
} from "~/store/api/personalEventsApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const METHOD_LABELS: Record<string, { icon: string; label: string }> = {
  push: { icon: "bell", label: "Push Notification" },
  email: { icon: "envelope", label: "Email" },
};

const EventRemindersScreen = () => {
  const { data: reminders, isLoading } = useGetEventRemindersQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const [deleteReminder, { isLoading: isDeleting }] = useDeleteEventReminderMutation();

  const handleDelete = (id: string, eventName: string) => {
    Alert.alert("Delete Reminder", `Remove reminder for "${eventName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteReminder(id)
            .unwrap()
            .then(() => {
              Toast.show({ type: "success", text1: "Reminder deleted" });
            })
            .catch((err) => {
              Toast.show({ type: "error", text1: err?.data?.message || "Failed to delete reminder" });
            });
        },
      },
    ]);
  };

  const items = reminders || [];

  return (
    <AppContainer gap={12}>
      <Text style={[typography.textXl, typography.fontBold]}>Event Reminders</Text>
      <Text style={[typography.textSm, { color: palette.grey }]}>
        {items.length} upcoming reminder{items.length !== 1 ? "s" : ""}
      </Text>

      {isLoading ? (
        <Loading marginVertical={32} />
      ) : items.length > 0 ? (
        items.map((reminder: any) => {
          const method = METHOD_LABELS[reminder.method] || METHOD_LABELS.push;
          return (
            <View key={reminder._id} style={styles.reminderCard}>
              <View style={styles.iconWrap}>
                <FontAwesome6 name={method.icon} size={18} color={palette.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[typography.textBase, typography.fontSemiBold]} numberOfLines={1}>
                  {reminder.eventName || reminder.event?.name || "Event"}
                </Text>
                <Text style={[typography.textSm, { color: palette.greyDark }]}>
                  {method.label}
                </Text>
                {reminder.reminderDate && (
                  <Text style={[typography.textXs, { color: palette.grey, marginTop: 2 }]}>
                    Remind on:{" "}
                    {new Date(reminder.reminderDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(reminder._id, reminder.eventName || "Event")}
                hitSlop={8}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Delete reminder"
              >
                <FontAwesome6 name="trash-can" size={16} color={palette.error} />
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <EmptyData
          title="No Reminders"
          subtitle="Set reminders from event details to get notified before events."
          icon="bell-slash"
        />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: palette.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.onPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
});

export default EventRemindersScreen;
