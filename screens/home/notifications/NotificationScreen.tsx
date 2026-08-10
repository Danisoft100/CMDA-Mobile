import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import Button from "~/components/form/Button";
import {
  useGetAllNotificationsQuery,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useRestoreNotificationMutation,
} from "~/store/api/notificationsApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import Loading from "~/components/Loading";
import Toast from "react-native-toast-message";
import { notificationTitle } from "~/utils/notificationPresentation";

const NotificationScreen = ({ navigation }: any) => {
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [lastDeleted, setLastDeleted] = useState<any>(null);
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [restoreNotification] = useRestoreNotificationMutation();
  const { data, isLoading, isFetching, isError, refetch } = useGetAllNotificationsQuery(
    { page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (!data) return;
    const incoming = data.items ?? [];
    setAllNotifications((previous) => {
      const combined = page === 1 ? incoming : [...previous, ...incoming];
      return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
    });
    setTotalPages(data.meta?.totalPages ?? 0);
  }, [data, page]);

  const handleRefresh = () => {
    if (page !== 1) setPage(1);
    else void refetch();
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(null).unwrap();
      setAllNotifications((items) => items.map((item) => ({ ...item, read: true })));
      Toast.show({ type: "success", text1: "All notifications marked as read" });
    } catch {
      Toast.show({ type: "error", text1: "Couldn't update notifications" });
    }
  };

  const handleDelete = async (id: string) => {
    const removed = allNotifications.find((item) => item._id === id);
    try {
      await deleteNotification(id).unwrap();
      setAllNotifications((items) => items.filter((item) => item._id !== id));
      setLastDeleted(removed);
      setTimeout(() => setLastDeleted((current: any) => current?._id === id ? null : current), 6000);
    } catch {
      Toast.show({ type: "error", text1: "Couldn't delete notification" });
    }
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    try {
      await restoreNotification(lastDeleted._id).unwrap();
      setAllNotifications((items) => [lastDeleted, ...items]);
      setLastDeleted(null);
    } catch {
      Toast.show({ type: "error", text1: "Couldn't restore notification" });
    }
  };

  const visibleNotifications = filter === "unread"
    ? allNotifications.filter((item) => !item.read)
    : allNotifications;

  if (isLoading && !allNotifications.length) {
    return <AppContainer><Loading center marginVertical={48} /></AppContainer>;
  }

  if (isError && !allNotifications.length) {
    return (
      <AppContainer>
        <View style={styles.feedback}>
          <EmptyData
            title="Notifications unavailable"
            subtitle="We couldn't load your notifications. Check your connection and try again."
            icon="alert-circle-outline"
          />
          <Button label="Try Again" onPress={refetch} />
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer withScrollView={false}>
      <View style={styles.toolbar}>
        <Text style={[typography.textBase, typography.fontSemiBold]}>
          {allNotifications.some((item) => !item.read) ? "New updates" : "You're all caught up"}
        </Text>
        {allNotifications.some((item) => !item.read) ? (
          <TouchableOpacity
            onPress={() => void handleMarkAll()}
            disabled={isMarkingAll}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAll}>{isMarkingAll ? "Updating…" : "Mark all read"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filters} accessibilityRole="tablist">
        {(["all", "unread"] as const).map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            onPress={() => setFilter(value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === value }}
          >
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
              {value === "all" ? "All" : "Unread"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {lastDeleted ? (
        <View style={styles.undoBar}>
          <Text style={[typography.textSm, { flex: 1 }]}>Notification removed</Text>
          <TouchableOpacity onPress={() => void handleUndo()} accessibilityRole="button">
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={visibleNotifications}
        keyExtractor={(item) => item._id}
        refreshing={isFetching && page === 1}
        onRefresh={handleRefresh}
        onEndReached={() => {
          if (!isFetching && page < totalPages) setPage((current) => current + 1);
        }}
        onEndReachedThreshold={0.35}
        contentContainerStyle={visibleNotifications.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<EmptyData title={filter === "unread" ? "No unread notifications" : "Notifications"} icon="bell-outline" />}
        ListFooterComponent={isFetching && page > 1 ? <Loading marginVertical={16} size={18} /> : null}
        renderItem={({ item: notif }) => (
          <TouchableOpacity
            style={[styles.item, !notif.read && styles.unreadItem]}
            onPress={() => navigation.navigate("home-notifications-single", { item: notif })}
            accessibilityRole="button"
            accessibilityLabel={`${notif.read ? "Read" : "Unread"} ${notif.type}: ${notif.content}. ${formatDate(notif.createdAt).date} at ${formatDate(notif.createdAt).time}`}
          >
            <View style={styles.icon}>
              <MCIcon name="bell" size={24} color={notif.read ? palette.greyDark : palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[typography.textLg, notif.read ? typography.fontMedium : typography.fontBold, { flex: 1 }]}>
                  {notificationTitle(notif)}
                </Text>
                {!notif.read ? <View style={styles.unreadDot} accessibilityLabel="Unread" /> : null}
              </View>
              <Text style={[typography.textBase, { marginBottom: 4 }]} numberOfLines={2}>
                {notif.content}
              </Text>
              <Text style={[typography.textSm, { color: palette.greyDark }]}>
                {formatDate(notif.createdAt).date + " at " + formatDate(notif.createdAt).time}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(event) => { event.stopPropagation(); void handleDelete(notif._id); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Delete notification"
              style={styles.deleteBtn}
            >
              <MCIcon name="trash-can-outline" size={20} color={palette.greyDark} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  feedback: { gap: 16 },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: palette.white },
  filterButtonActive: { backgroundColor: palette.primary },
  filterText: { ...typography.textSm, ...typography.fontSemiBold, color: palette.greyDark },
  filterTextActive: { color: palette.white },
  undoBar: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginBottom: 8, borderRadius: 8, backgroundColor: palette.onPrimary },
  undoText: { ...typography.textSm, ...typography.fontBold, color: palette.primary, padding: 4 },
  markAll: { ...typography.textSm, ...typography.fontSemiBold, color: palette.primary, paddingVertical: 10 },
  list: { paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  icon: {
    backgroundColor: palette.onPrimaryContainer,
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomColor: palette.greyLight,
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  unreadItem: { backgroundColor: palette.onPrimary },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary },
  deleteBtn: { padding: 8, marginLeft: 4 },
});

export default NotificationScreen;
