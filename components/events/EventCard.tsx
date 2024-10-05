import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";

const EventCard = ({ width = 320, row, title, image, date, type, location, description, style }: any) => {
  return (
    <View style={[styles.card, { width }, row ? styles.rowCard : styles.columnCard, style]}>
      <Image source={{ uri: image }} style={[styles.image, row && styles.imageRow]} resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>{type}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.date}>{formatDate(date).date + ", " + formatDate(date).time}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderColor: palette.greyLight,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "column",
    overflow: "hidden",
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  columnCard: {
    flexDirection: "column",
    gap: 8,
  },
  image: {
    backgroundColor: palette.onPrimary,
    height: 144,
    width: "100%",
    borderRadius: 12,
  },
  imageRow: {
    width: 200,
    height: 112,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 16,
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  title: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  description: {
    ...typography.textSm,
    color: palette.greyDark,
    marginBottom: 8,
  },
  date: {
    ...typography.textXs,
    color: palette.black,
  },
  location: {
    ...typography.textXs,
    color: palette.black,
    marginTop: 4,
  },
});

export default EventCard;
