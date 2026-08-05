import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import {
  useGetPersonalEventsQuery,
  useCreatePersonalEventMutation,
  useDeletePersonalEventMutation,
} from "~/store/api/personalEventsApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  { value: "birthday", label: "Birthday", icon: "cake-candles" },
  { value: "milestone", label: "Milestone", icon: "trophy" },
  { value: "reminder", label: "Reminder", icon: "bell" },
  { value: "other", label: "Other", icon: "calendar" },
];

const PRESET_COLORS = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C"];

const PersonalEventsScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("reminder");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const { data: personalEvents, isLoading } = useGetPersonalEventsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const [createEvent, { isLoading: isCreating }] = useCreatePersonalEventMutation();
  const [deleteEvent] = useDeletePersonalEventMutation();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setCategory("reminder");
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleCreate = () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" });
      return;
    }
    if (!date.trim()) {
      Toast.show({ type: "error", text1: "Date is required" });
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Toast.show({ type: "error", text1: "Date must be in YYYY-MM-DD format" });
      return;
    }
    createEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      category,
      color: selectedColor,
    })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Event created!" });
        resetForm();
        setShowForm(false);
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: err?.data?.message || "Failed to create event" });
      });
  };

  const handleDelete = (id: string, eventTitle: string) => {
    Alert.alert("Delete Event", `Delete "${eventTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEvent(id)
            .unwrap()
            .catch((err) => {
              Toast.show({ type: "error", text1: err?.data?.message || "Failed to delete event" });
            });
        },
      },
    ]);
  };

  const sortedEvents = (personalEvents || [])
    .slice()
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCategoryIcon = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat)?.icon || "calendar";
  };

  return (
    <AppContainer gap={12}>
      <View style={styles.headerRow}>
        <Text style={[typography.textXl, typography.fontBold]}>Personal Events</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
          accessibilityRole="button"
          accessibilityLabel="Add personal event"
        >
          <FontAwesome6 name="plus" size={16} color={palette.white} />
          <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.white }]}>
            Add Event
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loading marginVertical={32} />
      ) : sortedEvents.length > 0 ? (
        sortedEvents.map((evt: any) => (
          <View key={evt._id} style={[styles.eventCard, { borderLeftColor: evt.color || palette.primary }]}>
            <View style={styles.eventIcon}>
              <FontAwesome6
                name={getCategoryIcon(evt.category)}
                size={18}
                color={evt.color || palette.primary}
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={[typography.textBase, typography.fontSemiBold]}>{evt.title}</Text>
              {evt.description ? (
                <Text style={[typography.textSm, { color: palette.greyDark }]} numberOfLines={2}>
                  {evt.description}
                </Text>
              ) : null}
              <Text style={[typography.textXs, { color: palette.grey, marginTop: 4 }]}>
                {new Date(evt.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {evt.category}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(evt._id, evt.title)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${evt.title}`}
            >
              <FontAwesome6 name="trash-can" size={16} color={palette.error} />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <EmptyData
          title="No Personal Events"
          subtitle="Tap the + button to add birthdays, milestones, or reminders."
          icon="calendar-plus"
        />
      )}

      {/* Create Event Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <SafeAreaView style={styles.modalContainer} edges={["top", "left", "right", "bottom"]}>
          <View style={styles.modalHeader}>
            <Text style={[typography.textLg, typography.fontBold]}>New Personal Event</Text>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowForm(false);
              }}
              hitSlop={8}
            >
              <FontAwesome6 name="xmark" size={20} color={palette.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.formBody}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Event title"
              placeholderTextColor={palette.grey}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Optional description"
              placeholderTextColor={palette.grey}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-25"
              placeholderTextColor={palette.grey}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoryBtn, category === cat.value && styles.categoryBtnActive]}
                  onPress={() => setCategory(cat.value)}
                >
                  <FontAwesome6
                    name={cat.icon}
                    size={14}
                    color={category === cat.value ? palette.white : palette.greyDark}
                  />
                  <Text
                    style={[
                      typography.textXs,
                      typography.fontMedium,
                      { color: category === cat.value ? palette.white : palette.greyDark },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorBtnActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <FontAwesome6 name="check" size={14} color={palette.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label="Create Event"
              onPress={handleCreate}
              loading={isCreating}
              style={{ marginTop: 8 }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: palette.white,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.onPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: palette.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  formBody: {
    padding: 16,
    gap: 12,
  },
  label: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.greyDark,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.textSm,
    color: palette.black,
    backgroundColor: palette.background,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  categoryBtnActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: palette.black,
  },
});

export default PersonalEventsScreen;
