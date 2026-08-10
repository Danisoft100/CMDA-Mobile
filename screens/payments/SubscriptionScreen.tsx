import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl, Linking } from "react-native";
import { Paths, File } from "expo-file-system";
import {
  useCancelSubscriptionMutation,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatusQuery,
  useRenewSubscriptionMutation,
} from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";
import { useRoles } from "~/utils/useRoles";
import { downloadAuthenticatedFile, safeReceiptFilename } from "~/utils/authenticatedDownload";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";
import { saveReceiptPdf, shareReceiptPdf } from "~/utils/receiptFiles";
import Button from "~/components/form/Button";
import EmptyData from "~/components/EmptyData";
import Loading from "~/components/Loading";

const SubscriptionScreen = () => {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: subscriptions, isLoading, isFetching, isError, refetch } = useGetAllSubscriptionsQuery(
    { page, limit },
    { refetchOnMountOrArgChange: true }
  );
  const { data: subscriptionStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useGetSubscriptionStatusQuery({});
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [renewSubscription, { isLoading: isRenewing }] = useRenewSubscriptionMutation();

  useEffect(() => {
    if (!subscriptions) return;
    const incoming = subscriptions.items ?? [];
    setAllSubscriptions((previous) => {
      const combined = page === 1 ? incoming : [...previous, ...incoming];
      return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
    });
    setTotalPages(subscriptions.meta?.totalPages ?? 0);
  }, [subscriptions, page]);

  const refresh = () => {
    if (page !== 1) setPage(1);
    else void refetch();
    void refetchStatus();
  };

  const { isGlobalNetwork } = useRoles();

  const handleCancelSubscription = () => {
    Alert.alert("Cancel Subscription", "Your access will remain available until the current subscription expires.", [
      { text: "Keep Subscription", style: "cancel" },
      {
        text: "Cancel Subscription",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelSubscription({}).unwrap();
            await refetchStatus();
            Alert.alert("Subscription cancelled", "Automatic renewal has been disabled.");
          } catch (error: any) {
            Alert.alert("Unable to cancel", error?.data?.message || error?.message || "Please try again.");
          }
        },
      },
    ]);
  };

  const handleRenewSubscription = async () => {
    try {
      const result = await renewSubscription({}).unwrap();
      const checkoutUrl = result?.checkout_url || result?.links?.find?.((link: any) => link.rel === "approve")?.href;
      if (!checkoutUrl) throw new Error("The payment link was not returned.");
      await Linking.openURL(checkoutUrl);
    } catch (error: any) {
      Alert.alert("Unable to renew", error?.data?.message || error?.message || "Please try again.");
    }
  };

  const handleDownloadReceipt = async (subscriptionId: string, reference: string) => {
    setDownloadingId(subscriptionId);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "https://cmdabackend-38258a63fa98.herokuapp.com";
      const filename = safeReceiptFilename(reference, subscriptionId);
      const destination = new File(Paths.cache, `CMDA-Receipt-${filename}.pdf`);
      const file = await downloadAuthenticatedFile(
        `${baseUrl}/subscriptions/${subscriptionId}/receipt`,
        destination
      );
      
      const result = await saveReceiptPdf(file, `CMDA-Receipt-${filename}.pdf`, "Subscription Receipt");
      if (result.status === "saved") {
        Alert.alert("Receipt saved", "The PDF was saved to the folder you selected.", [
          { text: "Share", onPress: () => void shareReceiptPdf(file, "Subscription Receipt") },
          { text: "Done" },
        ]);
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      const knownMessage = error instanceof Error && /session has expired|permission|not available|valid PDF|not supported/i.test(error.message);
      const errorMessage = knownMessage ? error.message : "We couldn't download this receipt. Check your connection and try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <AppContainer refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={refresh} />}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeading}>
          <View>
            <Text style={[typography.textBase, typography.fontSemiBold]}>Subscription Status</Text>
            <Text style={[typography.textSm, { color: palette.greyDark }]}>
              {isLoadingStatus
                ? "Checking status..."
                : subscriptionStatus?.isActive
                  ? `Active until ${formatDate(subscriptionStatus.expiryDate).date}`
                  : subscriptionStatus?.cancelled
                    ? `Cancelled; access ends ${formatDate(subscriptionStatus.expiryDate).date}`
                    : "No active subscription"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: subscriptionStatus?.isActive ? palette.onSecondary : palette.error + "22" }]}>
            <Text style={[typography.textXs, typography.fontSemiBold, { color: subscriptionStatus?.isActive ? palette.secondary : palette.error }]}>
              {subscriptionStatus?.isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>
        <Button
          label={subscriptionStatus?.isActive && !subscriptionStatus?.cancelled ? "Cancel Renewal" : "Renew Subscription"}
          variant={subscriptionStatus?.isActive && !subscriptionStatus?.cancelled ? "outlined" : undefined}
          onPress={subscriptionStatus?.isActive && !subscriptionStatus?.cancelled ? handleCancelSubscription : handleRenewSubscription}
          loading={isCancelling || isRenewing}
        />
      </View>

      {/* Subscription History */}
      <View style={styles.table}>
        <Text style={[typography.textBase, typography.fontSemiBold]}>Subscription History</Text>

        <View style={styles.tableHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tableHeaderText}>Reference</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            <Text style={styles.tableHeaderText}>Frequency</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.tableHeaderText}>Status</Text>
            <Text style={styles.tableHeaderText}>Expiry</Text>
          </View>
          <View style={{ width: 60, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Receipt</Text>
          </View>
        </View>
        
        {isLoading && !allSubscriptions.length ? (
          <Loading center marginVertical={48} />
        ) : isError && !allSubscriptions.length ? (
          <View style={styles.feedback}>
            <EmptyData title="Subscriptions unavailable" subtitle="Check your connection and try again." icon="alert-circle-outline" />
            <Button label="Try Again" onPress={refetch} />
          </View>
        ) : allSubscriptions.length ? (
          allSubscriptions.map((sub: any, n: number) => {
            const isPaid = sub.isPaid !== false && sub.expiryDate;
            
            return (
            <View
              key={sub._id}
              style={[
                styles.tableItem,
                {
                  backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                  paddingVertical: (n + 1) % 2 ? 6 : 12,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.tableItemText}>{sub.reference}</Text>
                <Text style={[styles.tableItemText, { fontSize: 10 }]}>{formatDate(sub.createdAt).date}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={styles.tableItemText} numberOfLines={1}>
                  {formatCurrency(sub.amount, sub.currency || (isGlobalNetwork ? "USD" : "NGN"))}
                </Text>
                <Text style={styles.tableItemText} numberOfLines={1}>
                  {sub.frequency}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={[styles.tableItemText, { color: isPaid ? palette.success : palette.warning }]} numberOfLines={1}>
                  {isPaid ? "Paid" : "Pending"}
                </Text>
                <Text style={styles.tableItemText} numberOfLines={1}>
                  {sub.expiryDate ? formatDate(sub.expiryDate).date : "N/A"}
                </Text>
              </View>
              <View style={{ width: 60, alignItems: "center" }}>
                {isPaid ? (
                  <TouchableOpacity
                    onPress={() => handleDownloadReceipt(sub._id, sub.reference)}
                    disabled={downloadingId === sub._id}
                    style={styles.downloadButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Download receipt ${sub.reference}`}
                  >
                    {downloadingId === sub._id ? (
                      <Text style={styles.downloadButtonText}>...</Text>
                    ) : (
                      <MCIcon name="download" size={18} color={palette.onPrimary} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.tableItemText, { color: palette.grey, fontSize: 10 }]}>N/A</Text>
                )}
              </View>
            </View>
          )})
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <EmptyData title="Subscription Records" />
          </View>
        )}
        {page < totalPages ? (
          <Button label="Load More" onPress={() => setPage((current) => current + 1)} loading={isFetching && page > 1} style={{ marginTop: 12 }} />
        ) : null}
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  statusHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
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
  },
  tableItem: { flexDirection: "row", gap: 12, paddingHorizontal: 8 },
  tableItemText: { color: palette.greyDark, ...typography.textSm },
  downloadButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: palette.onPrimary,
    ...typography.textSm,
    ...typography.fontSemiBold,
  },
  feedback: { gap: 16 },
});

export default SubscriptionScreen;
