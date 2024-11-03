import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import Button from "~/components/form/Button";
import { useGetAllNotificationsQuery } from "~/store/api/notificationsApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

const NotificationScreen = ({ navigation }: any) => {
  const [allNotifications, setAllNotifications] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data: notificationsData,
    isLoading,
    isFetching,
  } = useGetAllNotificationsQuery({ page, limit: 10 }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (notificationsData) {
      setAllNotifications((prevNotifs: any) => {
        const combinedNotifs = [...prevNotifs, ...notificationsData.items];
        const uniqueNotifs = Array.from(new Set(combinedNotifs.map((notif) => notif._id))).map((_id) =>
          combinedNotifs.find((notif) => notif._id === _id)
        );
        return uniqueNotifs;
      });

      setTotalPages(notificationsData.meta?.totalPages);
    }
  }, [notificationsData]);

  return (
    <AppContainer>
      {isLoading ? (
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <Text style={[typography.textBase, { textAlign: "center" }]}>Loading...</Text>
        </View>
      ) : !allNotifications?.length ? (
        <EmptyData title="Notifications" icon="bell" />
      ) : (
        <View style={styles.card}>
          <View>
            {allNotifications.map((notif: any) => (
              <TouchableOpacity
                key={notif._id}
                style={styles.item}
                onPress={() => navigation.navigate("home-notifications-single", { item: notif })}
              >
                <View style={styles.icon}>
                  <MCIcon name="bell" size={24} color={notif.read ? palette.onPrimary : palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textLg, notif.read ? typography.fontMedium : typography.fontBold]}>
                    New {notif.type}
                  </Text>
                  <Text
                    style={[
                      typography.textBase,
                      notif.read ? typography.fontMedium : typography.fontSemiBold,
                      { marginBottom: 4 },
                    ]}
                    numberOfLines={1}
                  >
                    {notif.content}
                  </Text>
                  <Text style={[typography.textSm]}>
                    {formatDate(notif.createdAt).date + " || " + formatDate(notif.createdAt).time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            disabled={page === totalPages}
            label={page === totalPages ? "The End" : "Load More"}
            loading={isLoading || isFetching}
            onPress={() => setPage((prev) => prev + 1)}
            style={{ marginTop: 16 }}
          />
        </View>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    backgroundColor: palette.onPrimaryContainer,
    height: 48,
    width: 48,
    overflow: "hidden",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomColor: palette.greyLight,
    borderBottomWidth: 1,
    paddingTop: 6,
    paddingBottom: 12,
  },
});

export default NotificationScreen;
