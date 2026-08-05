import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl } from "react-native";
import { Paths, File } from "expo-file-system";
import { useGetAllSubscriptionsQuery } from "~/store/api/paymentsApi";
import { useGetSubscriptionStatusQuery, useCancelSubscriptionMutation, useRenewSubscriptionMutation } from "~/store/api/subscriptionStatusApi";
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

  const { data: subscriptionStatus, isLoading: isLoadingStatus } = useGetSubscriptionStatusQuery({});
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
  };

  const { isGlobalNetwork } = useRoles();

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

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription({}).unwrap();
              Alert.alert("Subscription Cancelled", "Your subscription has been cancelled. You will have access until the end of your current billing period.");
            } catch (error: any) {
              Alert.alert("Error", error?.data?.message || "Unable to cancel subscription. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleRenewSubscription = () => {
    Alert.alert("Renew Subscription", "Would you like to renew your subscription?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Renew",
        onPress: async () => {
          try {
            const result = await renewSubscription({}).unwrap();
            if (result?.paymentUrl) {
              Alert.alert("Payment Required", "You will be redirected to complete payment.");
            } else {
              Alert.alert("Subscription Renewed", "Your subscription has been renewed successfully.");
            }
          } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Unable to renew subscription. Please try again.");
          }
        },
      },
    ]);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const status = subscriptionStatus || {};
  const isActive = status.isActive !== false;
  const expiryDate = status.expiryDate || status.expiry;
  const autoRenew = status.autoRenew !== false;
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  return (
    <AppContainer refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={refresh} />}>
      {/* Subscription Status Section */}
      <View style={styles.statusCard}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 12 }]}>Subscription Status</Text>
        
        {isLoadingStatus ? (
          <Loading center marginVertical={16} />
        ) : (
          <View style={{ gap: 12 }}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? palette.onSecondary : palette.error + "33" }]}>
                  <Text style={[styles.statusBadgeText, { color: isActive ? palette.secondary : palette.error }]}>
                    {isActive ? "Active" : "Expired"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Auto-Renew</Text>
                <View style={[styles.statusBadge, { backgroundColor: autoRenew ? palette.onSecondary : palette.greyLight }]}>
                  <Text style={[styles.statusBadgeText, { color: autoRenew ? palette.secondary : palette.greyDark }]}>
                    {autoRenew ? "On" : "Off"}
                  </Text>
                </View>
              </View>
            </View>

            {expiryDate && (
              <View style={styles.statusDetail}>
                <MCIcon name="calendar-clock" size={16} color={palette.grey} />
                <Text style={styles.statusDetailText}>
                  Expires: {formatDate(expiryDate).date}
                  {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                    <Text style={{ color: daysUntilExpiry <= 7 ? palette.warning : palette.greyDark }}>
                      {" "}({daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} remaining)
                    </Text>
                  )}
                  {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
                    <Text style={{ color: palette.error }}> (Expired)</Text>
                  )}
                </Text>
              </View>
            )}

            <View style={styles.statusActions}>
              {isActive ? (
                <Button
                  label="Cancel Subscription"
                  variant="outlined"
                  dense
                  onPress={handleCancelSubscription}
                  loading={isCancelling}
                  style={{ flex: 1 }}
                />
              ) : (
                <Button
                  label="Renew Subscription"
                  dense
                  onPress={handleRenewSubscription}
                  loading={isRenewing}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        )}
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
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 8,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    gap: 16,
  },
  statusItem: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.grey,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...typography.textSm,
    ...typography.fontSemiBold,
  },
  statusDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDetailText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.greyDark,
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
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
