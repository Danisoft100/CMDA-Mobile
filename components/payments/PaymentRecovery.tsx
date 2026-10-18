import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Button from "~/components/form/Button";
import QueryFeedback from "~/components/QueryFeedback";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { selectAuth } from "~/store/slices/authSlice";
import {
  useGetAllDonationsQuery,
  useSyncDonationPaymentStatusMutation,
  useSyncOrderPaymentStatusMutation,
  useSyncSubscriptionPaymentStatusMutation,
  useSyncEventPaymentStatusMutation,
} from "~/store/api/paymentsApi";
import { useGetOrderHistoryQuery } from "~/store/api/productsApi";
import { useGetRegisteredEventsQuery } from "~/store/api/eventsApi";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";

export default function PaymentRecovery() {
  const { user } = useSelector(selectAuth);
  const [syncingPayments, setSyncingPayments] = useState<string[]>([]);
  const [checkingAll, setCheckingAll] = useState(false);
  const [syncDonationPayment] = useSyncDonationPaymentStatusMutation();
  const [syncOrderPayment] = useSyncOrderPaymentStatusMutation();
  const [syncSubscriptionPayment] = useSyncSubscriptionPaymentStatusMutation();
  const [syncEventPayment] = useSyncEventPaymentStatusMutation();
  const donationQuery = useGetAllDonationsQuery({
    page: 1,
    limit: 100,
    feedbackHandled: true,
  });
  const orderQuery = useGetOrderHistoryQuery({
    page: 1,
    limit: 100,
    feedbackHandled: true,
  });
  const eventQuery = useGetRegisteredEventsQuery({
    page: 1,
    limit: 100,
    feedbackHandled: true,
  });
  const donations = donationQuery.data,
    orders = orderQuery.data,
    events = eventQuery.data;
  // Find pending transactions that need sync
  const pendingTransactions = useMemo(() => {
    const pending: Array<{
      id: string;
      type: "donation" | "subscription" | "order" | "event";
      reference: string;
      amount?: number;
      currency?: string;
      name?: string;
      isPaid?: boolean;
    }> = [];

    // Add pending donations (donations use 'reference' field, not 'paymentReference')
    donations?.items?.forEach((donation: any) => {
      if (donation.isPaid === false && donation.reference) {
        pending.push({
          id: donation._id,
          type: "donation",
          reference: donation.reference,
          amount: donation.totalAmount,
          currency: donation.currency || "NGN",
          name: `Donation - ${donation.areasOfNeed?.[0]?.name || "General"}`,
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
      if (order.isPaid === false && order.paymentReference) {
        pending.push({
          id: order._id,
          type: "order",
          reference: order.paymentReference,
          amount: order.totalAmount,
          currency: order.currency || "NGN",
          name: `Order - ${order.products?.length || 0} item(s)`,
          isPaid: order.isPaid,
        });
      }
    });

    // Add pending event payments (embedded in registeredUsers array)
    (events?.events || events?.items || []).forEach((event: any) => {
      const userRegistration = event.registeredUsers?.find(
        (reg: any) =>
          String(reg.userId?._id || reg.userId) === String(user?._id) &&
          reg.paymentReference &&
          reg.isPaid === false,
      );
      if (userRegistration) {
        pending.push({
          id: event._id,
          type: "event",
          reference: userRegistration.paymentReference,
          amount: userRegistration.amount,
          currency: userRegistration.currency || "NGN",
          name: `${event.isConference ? "Conference" : "Event"} - ${event.name}`,
          isPaid: false,
        });
      }
    });

    return pending;
  }, [donations, orders, events, user]);

  const syncPaymentStatus = async (transaction: any) => {
    if (syncingPayments.includes(transaction.id)) return;

    setSyncingPayments((prev) => [...prev, transaction.id]);

    try {
      let result;
      const payload = { reference: transaction.reference };

      switch (transaction.type) {
        case "donation":
          result = await syncDonationPayment(payload).unwrap();
          break;
        case "subscription":
          result = await syncSubscriptionPayment(payload).unwrap();
          break;
        case "order":
          result = await syncOrderPayment(payload).unwrap();
          break;
        case "event":
          result = await syncEventPayment(payload).unwrap();
          break;
      }

      Toast.show({
        type: "success",
        text1: "Payment checked",
        text2: result?.message || "Payment status updated successfully",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Payment check failed",
        text2: getApiErrorMessage(
          error,
          "Unable to check this payment. Please try again.",
        ),
      });
    } finally {
      setSyncingPayments((prev) => prev.filter((id) => id !== transaction.id));
    }
  };

  const syncAllPayments = async () => {
    if (checkingAll || syncingPayments.length) return;
    if (pendingTransactions.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Pending Payments",
        text2: "All your payments are up to date",
      });
      return;
    }

    Toast.show({
      type: "info",
      text1: "Syncing Payments",
      text2: `Checking ${pendingTransactions.length} payment(s)...`,
    });

    setCheckingAll(true);
    try {
      for (const transaction of pendingTransactions)
        await syncPaymentStatus(transaction);
    } finally {
      setCheckingAll(false);
    }
  };

  const loading =
    donationQuery.isFetching || orderQuery.isFetching || eventQuery.isFetching;
  const error = donationQuery.error || orderQuery.error || eventQuery.error;
  return (
    <View style={{ gap: 12 }}>
      <Text style={[typography.textBase, { color: palette.greyDark }]}>
        Check earlier payment attempts here. Checking a status does not charge
        you again. Only the latest 100 records in each category are checked.
      </Text>
      <QueryFeedback
        label="earlier payments"
        loading={loading}
        error={error}
        onRetry={() => {
          donationQuery.refetch();
          orderQuery.refetch();
          eventQuery.refetch();
        }}
      />
      {!loading && !error && !pendingTransactions.length ? (
        <Text>No earlier payments need checking.</Text>
      ) : null}
      {/* Payment Sync Section */}
      {pendingTransactions.length > 0 && (
        <View style={[styles.card, { gap: 12 }]}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={[typography.textLg, typography.fontSemiBold, { flex: 1 }]}
            >
              Payment Status
            </Text>
            <Button
              label="Check Statuses"
              variant="outlined"
              dense
              onPress={syncAllPayments}
              loading={checkingAll || syncingPayments.length > 0}
            />
          </View>

          <Text style={[typography.textSm, { color: palette.grey }]}>
            Found {pendingTransactions.length} pending payment(s) that may need
            status updates
          </Text>

          <View style={{ gap: 8 }}>
            {pendingTransactions.map((transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionRow,
                  {
                    backgroundColor:
                      index % 2 === 0 ? palette.onPrimary : palette.background,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textBase, typography.fontMedium]}>
                    {transaction.name}
                  </Text>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    {transaction.amount
                      ? formatCurrency(transaction.amount, transaction.currency)
                      : "Amount pending"}
                  </Text>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    Ref: {transaction.reference.substring(0, 12)}...
                  </Text>
                </View>
                <Button
                  label="Check"
                  variant="outlined"
                  dense
                  onPress={() => syncPaymentStatus(transaction)}
                  loading={syncingPayments.includes(transaction.id)}
                  disabled={checkingAll}
                  style={{ minWidth: 70 }}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
const styles = {
  card: { padding: 14, borderRadius: 10, backgroundColor: palette.white },
  transactionRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
};
