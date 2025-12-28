import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useGetAllSubscriptionsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";
import { useRoles } from "~/utils/useRoles";
import { getToken } from "~/utils/token";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";

const SubscriptionScreen = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: subscriptions, isLoading } = useGetAllSubscriptionsQuery(
    { page, limit, date: new Date().toString() },
    { refetchOnMountOrArgChange: true }
  );

  const { isGlobalNetwork } = useRoles();

  const handleDownloadReceipt = async (subscriptionId: string, reference: string) => {
    setDownloadingId(subscriptionId);
    try {
      const token = await getToken();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.cmdanigeria.net";
      const file = new File(Paths.cache, `CMDA-Receipt-${reference}.pdf`);
      
      // Download the file using fetch
      const response = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to download receipt: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      await file.write(new Uint8Array(arrayBuffer));
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("Success", "Receipt downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download receipt. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <AppContainer>
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
        
        {subscriptions?.items?.length ? (
          subscriptions?.items?.map((sub: any, n: number) => {
            // Check if subscription is paid - subscriptions are typically created after payment confirmation
            // but we check for isPaid field or assume paid if expiryDate exists
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
            <Text style={[typography.textBase]}>No subscription record to display</Text>
          </View>
        )}
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
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
});

export default SubscriptionScreen;
