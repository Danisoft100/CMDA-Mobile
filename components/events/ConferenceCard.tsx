import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { formatCurrency } from "~/utils/currencyFormatter";

const ConferenceCard = ({ 
  width = 288, 
  row, 
  title, 
  image, 
  date, 
  type, 
  location, 
  description, 
  style, 
  conference 
}: any) => {
  const getRegistrationStatusDisplay = () => {
    if (!conference?.registrationStatus) return null;
    
    const statusConfig = {
      regular: { text: "Early Bird", color: palette.success, bgColor: palette.success + '20' },
      late: { text: "Late Registration", color: palette.warning, bgColor: palette.warning + '20' },
      closed: { text: "Closed", color: palette.error, bgColor: palette.error + '20' },
    };
    
    const config = statusConfig[conference.registrationStatus as keyof typeof statusConfig];
    return config ? (
      <Text style={[styles.statusBadge, { color: config.color, backgroundColor: config.bgColor }]}>
        {config.text}
      </Text>
    ) : null;
  };

  const getCurrentPrice = () => {
    if (!conference?.isPaid || !conference?.paymentPlans?.length) return null;
    
    const prices = conference.paymentPlans.map((plan: any) => plan.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatCurrency(minPrice, "NGN");
    } else {
      return `${formatCurrency(minPrice, "NGN")} - ${formatCurrency(maxPrice, "NGN")}`;
    }
  };

  return (
    <View style={[styles.card, { width }, row ? styles.rowCard : styles.columnCard, style]}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.textContainer}>
        <View style={styles.tagsContainer}>
          <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>{type}</Text>
          {conference && (
            <Text style={[styles.conferenceType, { backgroundColor: palette.onSecondary, color: palette.secondary }]}>
              {conference.type || 'Conference'}
            </Text>
          )}
          {getRegistrationStatusDisplay()}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.date}>{formatDate(date).date + ", " + formatDate(date).time}</Text>
        
        {conference && (conference.zone || conference.region) && (
          <View style={styles.conferenceDetails}>
            {conference.zone && (
              <Text style={styles.conferenceInfo}>Zone: {conference.zone}</Text>
            )}
            {conference.region && (
              <Text style={styles.conferenceInfo}>Region: {conference.region}</Text>
            )}
          </View>
        )}
        
        {/* Price Information */}
        {conference?.isPaid && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Fee: </Text>
            <Text style={styles.priceValue}>{getCurrentPrice()}</Text>
          </View>
        )}
        
        {conference?.isPaid === false && (
          <View style={styles.priceContainer}>
            <Text style={[styles.priceValue, { color: palette.success }]}>Free</Text>
          </View>
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
  },
  textContainer: {
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
  conferenceType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 6,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  title: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  date: {
    ...typography.textSm,
    color: palette.black,
    marginBottom: 4,
  },
  conferenceDetails: {
    gap: 2,
    marginBottom: 4,
  },  conferenceInfo: {
    ...typography.textXs,
    color: palette.greyDark,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 4,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    ...typography.textSm,
    color: palette.greyDark,
  },
  priceValue: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
  location: {
    ...typography.textSm,
    color: palette.black,
  },
});

export default ConferenceCard;
