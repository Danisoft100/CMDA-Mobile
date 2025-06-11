import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";

const EventCard = ({ width = 288, row, title, image, date, type, location, description, style, conference }: any) => {
  return (
    <View style={[styles.card, { width }, row ? styles.rowCard : styles.columnCard, style]}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.textContainer}>        <View style={styles.tagsContainer}>
          <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>{type}</Text>
          {conference && (
            <Text style={[styles.type, { backgroundColor: palette.onSecondary, color: palette.secondary }]}>
              {conference.type} Conference
            </Text>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {/* <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text> */}
        <Text style={styles.date}>{formatDate(date).date + ", " + formatDate(date).time}</Text>
        {conference && (conference.zone || conference.region) && (
          <Text style={styles.conferenceInfo} numberOfLines={1}>
            {conference.zone && `Zone: ${conference.zone}`}
            {conference.zone && conference.region && " | "}
            {conference.region && `Region: ${conference.region}`}
          </Text>
        )}
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
  },  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
  },
  title: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  description: {
    ...typography.textSm,
    color: palette.greyDark,
    marginBottom: 8,
  },
  date: {
    ...typography.textSm,
    color: palette.black,
  },
  conferenceInfo: {
    ...typography.textXs,
    color: palette.greyDark,
    marginTop: 2,
  },
  location: {
    ...typography.textSm,
    color: palette.black,
    marginTop: 2,
  },
});

export default EventCard;
