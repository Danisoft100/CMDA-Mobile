import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import capitalizeWords from "~/utils/capitalizeWords";
import { useGetProfileQuery } from "~/store/api/profileApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatDate } from "~/utils/dateFormatter";
import { useGetAllTrainingsQuery } from "~/store/api/eventsApi";
import EmptyData from "~/components/EmptyData";
import { backgroundColor, textColor } from "~/constants/roleColor";
import Button from "~/components/form/Button";
import Toast from "react-native-toast-message";
import {
  useGetAllDonationsQuery,
  useGetAllSubscriptionsQuery,
  useSyncDonationPaymentStatusMutation,
  useSyncOrderPaymentStatusMutation,
  useSyncSubscriptionPaymentStatusMutation,
  useSyncEventPaymentStatusMutation,
} from "~/store/api/paymentsApi";
import { useGetOrderHistoryQuery } from "~/store/api/productsApi";
import { useGetRegisteredEventsQuery } from "~/store/api/eventsApi";

const ProfileScreen = ({ navigation, route }: any) => {
  const fromHome = route.params?.fromHome;
  const [syncingPayments, setSyncingPayments] = useState<string[]>([]);

  const { user } = useSelector(selectAuth);
  const { data: profile } = useGetProfileQuery(null, { refetchOnMountOrArgChange: true });

  // Payment sync mutations
  const [syncDonationPayment] = useSyncDonationPaymentStatusMutation();
  const [syncOrderPayment] = useSyncOrderPaymentStatusMutation();
  const [syncSubscriptionPayment] = useSyncSubscriptionPaymentStatusMutation();
  const [syncEventPayment] = useSyncEventPaymentStatusMutation();

  // Get user's payment history to identify pending transactions
  const { data: donations } = useGetAllDonationsQuery({ page: 1, limit: 100 });
  const { data: subscriptions } = useGetAllSubscriptionsQuery({ page: 1, limit: 100 });
  const { data: orders } = useGetOrderHistoryQuery({ page: 1, limit: 100 });
  const { data: events } = useGetRegisteredEventsQuery({ page: 1, limit: 100 });
  // Find pending transactions that need sync
  const pendingTransactions = useMemo(() => {
    const pending: Array<{
      id: string;
      type: 'donation' | 'subscription' | 'order' | 'event';
      reference: string;
      amount?: number;
      name?: string;
      isPaid?: boolean;
    }> = [];

    // Add pending donations (donations use 'reference' field, not 'paymentReference')
    donations?.items?.forEach((donation: any) => {
      if (!donation.isPaid && donation.reference) {
        pending.push({
          id: donation._id,
          type: 'donation',
          reference: donation.reference,
          amount: donation.totalAmount,
          name: `Donation - ${donation.areasOfNeed?.[0]?.name || 'General'}`,
          isPaid: donation.isPaid,
        });
      }
    });

    // Note: Subscriptions in the current schema don't have 'isPaid' field
    // They are created as paid through the confirm flow
    // We can only sync if we have incomplete payment flows
    // For now, skip subscription sync unless we modify the backend schema
    
    // Add pending orders (orders use 'paymentReference' field)
    orders?.items?.forEach((order: any) => {
      if (!order.isPaid && order.paymentReference) {
        pending.push({
          id: order._id,
          type: 'order',
          reference: order.paymentReference,
          amount: order.totalAmount,
          name: `Order - ${order.products?.length || 0} item(s)`,
          isPaid: order.isPaid,
        });
      }
    });

    // Add pending event payments (embedded in registeredUsers array)
    events?.events?.forEach((event: any) => {
      const userRegistration = event.registeredUsers?.find(
        (reg: any) => reg.userId === user?._id && reg.paymentReference && !reg.isPaid
      );
      if (userRegistration) {
        pending.push({
          id: event._id,
          type: 'event',
          reference: userRegistration.paymentReference,
          amount: userRegistration.amount,
          name: `${event.isConference ? 'Conference' : 'Event'} - ${event.name}`,
          isPaid: false,
        });
      }
    });

    return pending;
  }, [donations, subscriptions, orders, events, user]);

  const syncPaymentStatus = async (transaction: any) => {
    if (syncingPayments.includes(transaction.id)) return;

    setSyncingPayments(prev => [...prev, transaction.id]);

    try {
      let result;
      const payload = { reference: transaction.reference };

      switch (transaction.type) {
        case 'donation':
          result = await syncDonationPayment(payload).unwrap();
          break;
        case 'subscription':
          result = await syncSubscriptionPayment(payload).unwrap();
          break;
        case 'order':
          result = await syncOrderPayment(payload).unwrap();
          break;
        case 'event':
          result = await syncEventPayment(payload).unwrap();
          break;
      }

      Toast.show({
        type: 'success',
        text1: 'Payment Synced',
        text2: result.message || 'Payment status updated successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: error.data?.message || 'Failed to sync payment status',
      });
    } finally {
      setSyncingPayments(prev => prev.filter(id => id !== transaction.id));
    }
  };

  const syncAllPayments = async () => {
    if (pendingTransactions.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Pending Payments',
        text2: 'All your payments are up to date',
      });
      return;
    }

    Toast.show({
      type: 'info',
      text1: 'Syncing Payments',
      text2: `Checking ${pendingTransactions.length} payment(s)...`,
    });

    for (const transaction of pendingTransactions) {
      await syncPaymentStatus(transaction);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const INFO = useMemo(
    () => ({
      "Chapter/Region": profile?.region,
      Email: user?.email,
      Phone: profile?.phone,
    }),
    [profile, user]
  );

  const ABOUT = useMemo(
    () => ({
      "Date of Birth": formatDate(profile?.dateOfBirth).date,
      Gender: profile?.gender,
      ...(user?.role == "Student"
        ? { "Admission Year": profile?.admissionYear, "Year of Study": profile?.yearOfStudy }
        : { Specialty: profile?.specialty, "License Number": profile?.licenseNumber }),
      Bio: profile?.bio,
    }),
    [profile, user]
  );

  const { data: allTrainings, isLoading: isLoadingTrainings } = useGetAllTrainingsQuery(
    { membersGroup: user?.role },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <AppContainer gap={8}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
        {user?.subscribed ? (
          <View
            style={[
              { backgroundColor: palette.onSecondary, flexDirection: "row", alignItems: "center" },
              { paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderRadius: 8 },
            ]}
          >
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.secondary }]}>Subscribed</Text>
            <MCIcon name="check-decagram" size={20} color={palette.secondary} />
          </View>
        ) : (
          <View
            style={[
              { backgroundColor: palette.error + "33", flexDirection: "row", alignItems: "center" },
              { paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderRadius: 8 },
            ]}
          >
            <Ionicons name="warning" size={24} color={palette.error} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.error }]}>Not Subscribed</Text>
          </View>
        )}
        <Button
          dense
          icon="pencil"
          onPress={() => navigation.navigate(fromHome ? "home-profile-edit" : "more-profile-edit")}
          style={{ marginLeft: "auto" }}
        />
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <View style={{ alignItems: "center" }}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile?.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: backgroundColor[user?.role] }]}>
              <MCIcon name="account" size={48} color={textColor[user?.role]} />
            </View>
          )}
        </View>

        <View>
          <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>{profile?.fullName}</Text>
          <Text style={[typography.textBase, { textAlign: "center" }]}>{user?.membershipId}</Text>
          <Text style={[styles.role, { backgroundColor: backgroundColor[user?.role], color: textColor[user?.role] }]}>
            {capitalizeWords(user?.role)}
          </Text>
        </View>

        <View style={{ gap: 4, marginTop: 8 }}>
          {Object.entries(INFO).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value || "N/A"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>About Me</Text>
        <View style={{ gap: 4 }}>
          {Object.entries(ABOUT).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value || "N/A"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>Training Records</Text>
        <View style={[styles.table, { maxHeight: 300 }]}>
          <View style={styles.tableHeader}>
            <View style={{ flex: 3 }}>
              <Text style={styles.tableHeaderText}>Training Name</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
            {allTrainings?.length ? (
              allTrainings?.map((item: any, n: number) => (
                <View
                  key={item._id}
                  style={[
                    styles.tableItem,
                    {
                      backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                      paddingVertical: (n + 1) % 2 ? 6 : 12,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tableItemText, { textTransform: "capitalize" }]}>{item.name}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={[
                        typography.textXs,
                        typography.fontSemiBold,
                        { color: item.completedUsers.includes(user?._id) ? palette.success : palette.warning },
                      ]}
                    >
                      {item.completedUsers.includes(user?._id) ? "COMPLETED" : "PENDING"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyData title="trainings" />
            )}          </ScrollView>
        </View>
      </View>

      {/* Payment Sync Section */}
      {pendingTransactions.length > 0 && (
        <View style={[styles.card, { gap: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[typography.textLg, typography.fontSemiBold]}>Payment Status</Text>            <Button
              label="Sync All"
              variant="outlined"
              dense
              onPress={syncAllPayments}
              loading={syncingPayments.length > 0}
            />
          </View>
          
          <Text style={[typography.textSm, { color: palette.grey }]}>
            Found {pendingTransactions.length} pending payment(s) that may need status updates
          </Text>

          <View style={{ gap: 8 }}>
            {pendingTransactions.map((transaction, index) => (
              <View 
                key={transaction.id} 
                style={[
                  styles.transactionRow,
                  { backgroundColor: index % 2 === 0 ? palette.onPrimary : palette.background }
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textBase, typography.fontMedium]}>{transaction.name}</Text>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    {transaction.amount ? `₦${transaction.amount.toLocaleString()}` : 'Amount pending'}
                  </Text>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    Ref: {transaction.reference.substring(0, 12)}...
                  </Text>
                </View>
                  <Button
                  label="Sync"
                  variant="outlined"
                  dense
                  onPress={() => syncPaymentStatus(transaction)}
                  loading={syncingPayments.includes(transaction.id)}
                  style={{ minWidth: 70 }}
                />
              </View>
            ))}
          </View>
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  avatarIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  role: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
    textAlign: "center",
    ...typography.textSm,
    ...typography.fontSemiBold,
    alignSelf: "center",
  },
  profileRow: { flexDirection: "row", gap: 4 },
  profileLabel: { ...typography.textBase, color: palette.grey },
  profileValue: { ...typography.textBase, ...typography.fontMedium, color: palette.black },
  table: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
    backgroundColor: palette.greyLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  tableHeaderText: {
    ...typography.textSm,
    ...typography.fontBold,
    color: palette.black,
  },  tableItem: { flexDirection: "row", gap: 12, paddingHorizontal: 8 },
  tableItemText: { color: palette.greyDark, ...typography.textSm },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
});

export default ProfileScreen;
