import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { useMarkAsReadMutation } from "~/store/api/notificationsApi";
import Loading from "~/components/Loading";

const SingleNotificationScreen = ({ route }: any) => {
  const { item } = route?.params;

  const [markAsRead, { isLoading }] = useMarkAsReadMutation();

  useEffect(() => {
    markAsRead(item._id).unwrap().catch(() => undefined);
  }, [item._id, markAsRead]);

  return (
    <AppContainer>
      {isLoading ? (
        <Loading marginVertical={40} />
      ) : (
        <View style={styles.card}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <Text accessibilityRole="header" style={[typography.textXl, typography.fontSemiBold]}>
            New {item.type}
          </Text>
          <Text style={[typography.textLg, typography.fontMedium, styles.content]}>{item.content}</Text>
          <Text style={[typography.textSm, { color: palette.greyDark }]}>
            {formatDate(item.createdAt).date + " at " + formatDate(item.createdAt).time}
          </Text>
        </View>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: palette.onPrimary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.primary,
    textTransform: "uppercase",
  },
  content: {
    marginVertical: 4,
  },
});

export default SingleNotificationScreen;
