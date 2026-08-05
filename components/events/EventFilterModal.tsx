import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, typography } from "~/theme";
import Button from "~/components/form/Button";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { EventFilters } from "~/utils/eventFilters";

interface EventFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventFilters) => void;
  currentFilters: EventFilters;
}

const EVENT_TYPES = [
  { value: "Physical", label: "Physical" },
  { value: "Virtual", label: "Virtual" },
  { value: "Hybrid", label: "Hybrid" },
];

const MEMBER_GROUPS = [
  { value: "Student", label: "Student" },
  { value: "Doctor", label: "Doctor" },
  { value: "GlobalNetwork", label: "Global Network" },
];

const EVENT_DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "upcoming", label: "Upcoming" },
];

const EventFilterModal: React.FC<EventFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<EventFilters>(currentFilters);

  useEffect(() => {
    if (visible) setFilters(currentFilters);
  }, [currentFilters, visible]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
  };

  const renderFilterSection = (
    title: string,
    options: Array<{ value: string; label: string }>,
    currentValue: string | undefined,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === "all" ? !currentValue : currentValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${title}: ${option.label}`}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close event filters"
          >
            <FontAwesome6 name="xmark" size={20} color={palette.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Events</Text>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear all event filters"
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFilterSection(
            "Event Type",
            [{ value: "all", label: "All Types" }, ...EVENT_TYPES],
            filters.eventType,
            (value) => handleFilterChange("eventType", value)
          )}

          {renderFilterSection(
            "Members Group",
            [{ value: "all", label: "All Groups" }, ...MEMBER_GROUPS],
            filters.membersGroup,
            (value) => handleFilterChange("membersGroup", value)
          )}

          {renderFilterSection(
            "Date",
            [{ value: "all", label: "Any Date" }, ...EVENT_DATE_OPTIONS],
            filters.eventDate,
            (value) => handleFilterChange("eventDate", value)
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Apply Filters" onPress={handleApply} style={styles.applyButton} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  closeButton: { padding: 8 },
  headerTitle: { ...typography.textLg, ...typography.fontBold, color: palette.black },
  clearButton: { padding: 8 },
  clearText: { ...typography.textBase, ...typography.fontMedium, color: palette.primary },
  content: { flex: 1, padding: 16 },
  filterSection: { marginBottom: 24 },
  filterTitle: { ...typography.textBase, ...typography.fontSemiBold, color: palette.black, marginBottom: 12 },
  optionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  optionButtonSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
  optionText: { ...typography.textSm, ...typography.fontMedium, color: palette.black },
  optionTextSelected: { color: palette.white },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: palette.greyLight },
  applyButton: { backgroundColor: palette.primary },
});

export default EventFilterModal;
