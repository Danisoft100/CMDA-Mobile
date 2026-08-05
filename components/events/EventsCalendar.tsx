import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDate } from "~/utils/dateFormatter";
import { SafeAreaView } from "react-native-safe-area-context";

const DOT_COLORS: Record<string, string> = {
  Conference: "#E74C3C",
  Webinar: "#3498DB",
  Seminar: "#2ECC71",
  Training: "#F39C12",
};

const DEFAULT_DOT_COLOR = "#9B59B6";

const LEGEND_ITEMS = [
  { label: "Conference", color: DOT_COLORS.Conference },
  { label: "Webinar", color: DOT_COLORS.Webinar },
  { label: "Seminar", color: DOT_COLORS.Seminar },
  { label: "Training", color: DOT_COLORS.Training },
  { label: "Other", color: DEFAULT_DOT_COLOR },
  { label: "Personal", color: palette.primary, shape: "square" as const },
];

interface EventsCalendarProps {
  visible: boolean;
  onClose: () => void;
  events: any[];
  personalEvents?: any[];
  onDateSelect?: (date: string) => void;
  onCreatePersonalEvent?: (date: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EventsCalendar: React.FC<EventsCalendarProps> = ({ visible, onClose, events, personalEvents = [], onDateSelect, onCreatePersonalEvent }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const eventTypeMap = useMemo(() => {
    const map = new Map<string, string[]>();
    events.forEach((evt) => {
      if (evt.eventDateTime) {
        const d = new Date(evt.eventDateTime);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const existing = map.get(key) || [];
        if (!existing.includes(evt.eventType)) {
          existing.push(evt.eventType);
        }
        map.set(key, existing);
      }
    });
    return map;
  }, [events]);

  const personalEventDates = useMemo(() => {
    const dates = new Set<string>();
    personalEvents.forEach((evt) => {
      if (evt.date) {
        const d = new Date(evt.date);
        dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return dates;
  }, [personalEvents]);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach((evt) => {
      if (evt.eventDateTime) {
        const d = new Date(evt.eventDateTime);
        dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    personalEvents.forEach((evt) => {
      if (evt.date) {
        const d = new Date(evt.date);
        dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return dates;
  }, [events, personalEvents]);

  const getDotColor = (day: number, month: number, year: number): string => {
    const key = `${year}-${month}-${day}`;
    const types = eventTypeMap.get(key);
    if (types && types.length > 0) {
      return DOT_COLORS[types[0]] || DEFAULT_DOT_COLOR;
    }
    return DEFAULT_DOT_COLOR;
  };

  const isPersonalEvent = (day: number, month: number, year: number): boolean => {
    return personalEventDates.has(`${year}-${month}-${day}`);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];
    // Previous month days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({ day: prevMonthDays - i, month: m, year: y, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    // Next month days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfWeek]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number, month: number, year: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const hasEvent = (day: number, month: number, year: number) => {
    return eventDates.has(`${year}-${month}-${day}`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close calendar"
          >
            <FontAwesome6 name="xmark" size={20} color={palette.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Events Calendar</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <MCIcon name="chevron-left" size={28} color={palette.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <MCIcon name="chevron-right" size={28} color={palette.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.daysHeader}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeaderText}>{d}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((item, index) => {
            const todayFlag = isToday(item.day, item.month, item.year);
            const hasEvt = hasEvent(item.day, item.month, item.year);
            const isPersonal = isPersonalEvent(item.day, item.month, item.year);
            const dotColor = getDotColor(item.day, item.month, item.year);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  todayFlag && styles.todayCell,
                  !item.isCurrentMonth && styles.otherMonthCell,
                ]}
                onPress={() => {
                  const dateStr = `${item.year}-${String(item.month + 1).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`;
                  if (hasEvt && onDateSelect) {
                    onDateSelect(dateStr);
                    onClose();
                  } else if (onCreatePersonalEvent) {
                    onCreatePersonalEvent(dateStr);
                  }
                }}
                accessibilityRole={hasEvt || onCreatePersonalEvent ? "button" : undefined}
                accessibilityLabel={`${MONTHS[item.month]} ${item.day}, ${item.year}${hasEvt ? ", has events" : ", no events"}`}
                accessibilityState={{ selected: todayFlag }}
              >
                <Text
                  style={[
                    styles.dayText,
                    todayFlag && styles.todayText,
                    !item.isCurrentMonth && styles.otherMonthText,
                  ]}
                >
                  {item.day}
                </Text>
                {hasEvt && (
                  <View
                    style={[
                      isPersonal ? styles.personalEventDot : styles.eventDot,
                      { backgroundColor: dotColor },
                    ]}
                  />
                )}
                {!hasEvt && item.isCurrentMonth && onCreatePersonalEvent && (
                  <View style={styles.addHint}>
                    <Text style={styles.addHintText}>+</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  item.shape === "square" ? styles.legendSquare : styles.legendCircle,
                  { backgroundColor: item.color },
                ]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Events for this month */}
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 8 }]}>
            Events this month
          </Text>
          {events
            .filter((evt) => {
              const d = new Date(evt.eventDateTime);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .sort((a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime())
            .map((evt) => (
              <View key={evt._id} style={styles.eventRow}>
                <View style={styles.eventDateBadge}>
                  <Text style={[typography.textXs, typography.fontBold, { color: palette.primary }]}>
                    {new Date(evt.eventDateTime).getDate()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textSm, typography.fontMedium]} numberOfLines={1}>{evt.name}</Text>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    {formatDate(evt.eventDateTime).time} • {evt.eventType}
                  </Text>
                </View>
              </View>
            ))
            .length === 0 && (
            <Text style={[typography.textSm, { color: palette.grey }]}>No events this month</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white, padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  closeButton: { padding: 8 },
  headerTitle: { ...typography.textLg, ...typography.fontBold, color: palette.black },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  navButton: { padding: 8 },
  monthTitle: { ...typography.textLg, ...typography.fontSemiBold, color: palette.black },
  daysHeader: { flexDirection: "row", marginBottom: 8 },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.grey,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  todayCell: {
    backgroundColor: palette.primary + "15",
    borderRadius: 20,
  },
  otherMonthCell: { opacity: 0.3 },
  dayText: { ...typography.textSm, ...typography.fontMedium, color: palette.black },
  todayText: { color: palette.primary, ...typography.fontBold },
  otherMonthText: { color: palette.grey },
  eventDot: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primary,
  },
  personalEventDot: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: palette.primary,
  },
  addHint: {
    position: "absolute",
    bottom: 2,
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addHintText: {
    fontSize: 8,
    color: palette.grey,
    fontWeight: "600",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendSquare: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  legendText: {
    ...typography.textXs,
    color: palette.greyDark,
  },
  eventsList: { flex: 1, paddingTop: 8 },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  eventDateBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventsCalendar;
