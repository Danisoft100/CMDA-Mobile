import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { palette, typography } from "~/theme";
import Button from "~/components/form/Button";
import { CONFERENCE_TYPES, CONFERENCE_ZONES, CONFERENCE_REGIONS, MEMBER_GROUPS } from "~/constants/conferences";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface ConferenceFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ConferenceFilters) => void;
  currentFilters: ConferenceFilters;
}

interface ConferenceFilters {
  conferenceType?: string;
  zone?: string;
  region?: string;
  status?: string;
  membersGroup?: string;
}

const ConferenceFilterModal: React.FC<ConferenceFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<ConferenceFilters>(currentFilters);

  const statusOptions = [
    { value: 'regular', label: 'Early Bird Registration' },
    { value: 'late', label: 'Late Registration' },
    { value: 'closed', label: 'Registration Closed' },
    { value: 'all', label: 'All Statuses' },
  ];
  const membersGroupOptions = [
    { value: 'all', label: 'All Groups' },
    ...MEMBER_GROUPS,
  ];

  const handleFilterChange = (key: keyof ConferenceFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
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
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              currentValue === option.value && styles.optionButtonSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              currentValue === option.value && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome6 name="xmark" size={20} color={palette.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Conferences</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFilterSection(
            "Conference Type",
            [{ value: 'all', label: 'All Types' }, ...CONFERENCE_TYPES],
            filters.conferenceType,
            (value) => handleFilterChange('conferenceType', value)
          )}

          {renderFilterSection(
            "Zone",
            [{ value: 'all', label: 'All Zones' }, ...CONFERENCE_ZONES],
            filters.zone,
            (value) => handleFilterChange('zone', value)
          )}

          {renderFilterSection(
            "Region",
            [{ value: 'all', label: 'All Regions' }, ...CONFERENCE_REGIONS],
            filters.region,
            (value) => handleFilterChange('region', value)
          )}

          {renderFilterSection(
            "Registration Status",
            statusOptions,
            filters.status,
            (value) => handleFilterChange('status', value)
          )}

          {renderFilterSection(
            "Target Audience",
            membersGroupOptions,
            filters.membersGroup,
            (value) => handleFilterChange('membersGroup', value)
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <Button
            label="Apply Filters"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.black,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.black,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  optionButtonSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  optionText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
  },
  optionTextSelected: {
    color: palette.white,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
  },
  applyButton: {
    backgroundColor: palette.primary,
  },
});

export default ConferenceFilterModal;
