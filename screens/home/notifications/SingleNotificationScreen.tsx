import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { useGetNotificationQuery, useMarkAsReadMutation } from "~/store/api/notificationsApi";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import { notificationDestination, notificationTitle } from "~/utils/notificationPresentation";
import { navigate } from "~/utils/navigationService";

const SingleNotificationScreen = ({ route, navigation }: any) => {
  const routeItem = route?.params?.item;
  const id = route?.params?.id || routeItem?._id;
  const { data: fetchedItem, isLoading, isError, error, refetch } = useGetNotificationQuery(id, { skip: !id || Boolean(routeItem) });
  const item = routeItem || fetchedItem;
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (item?._id && !item.read) markAsRead(item._id).unwrap().catch(() => undefined);
  }, [item, markAsRead]);

  useEffect(() => {
    const status = (error as any)?.status;
    if ((!id || status === 404) && !item) {
      navigation.replace("home-notifications");
    }
  }, [error, id, item, navigation]);

  const destination = notificationDestination(item);
  const openDestination = () => {
    if (!destination) return;
    navigate("tab", {
      screen: destination.tab,
      params: { screen: destination.screen, params: destination.params },
    });
  };

  return (
    <AppContainer>
      {isLoading && !item ? (
        <Loading marginVertical={40} />
      ) : isError && !item ? (
        <View style={styles.feedback}>
          <EmptyData title="Notification unavailable" subtitle="It may have been removed or the connection was interrupted." icon="alert-circle-outline" />
          <TouchableOpacity style={styles.action} onPress={() => void refetch()} accessibilityRole="button">
            <Text style={styles.actionText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : item ? (
        <View style={styles.card}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{notificationTitle(item)}</Text>
          </View>
          <Text accessibilityRole="header" style={[typography.textXl, typography.fontSemiBold]}>
            {notificationTitle(item)}
          </Text>
          <Text style={[typography.textLg, styles.content]}>{item.content}</Text>
          <Text style={[typography.textSm, { color: palette.greyDark }]}>
            {formatDate(item.createdAt).date + " at " + formatDate(item.createdAt).time}
          </Text>
          {destination ? (
            <TouchableOpacity style={styles.action} onPress={openDestination} accessibilityRole="button">
              <Text style={styles.actionText}>{destination.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  feedback: { gap: 16 },
  card: {
    padding: 20,
    borderRadius: 12,
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
  typeText: { ...typography.textXs, ...typography.fontSemiBold, color: palette.primary, textTransform: "uppercase" },
  content: { marginVertical: 4, lineHeight: 26 },
  action: { marginTop: 8, borderRadius: 10, backgroundColor: palette.primary, paddingHorizontal: 18, paddingVertical: 13, alignItems: "center" },
  actionText: { ...typography.textBase, ...typography.fontSemiBold, color: palette.white },
});

export default SingleNotificationScreen;
