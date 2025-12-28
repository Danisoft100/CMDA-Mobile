import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import EmptyData from "~/components/EmptyData";
import { useGetAllDonationsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";
import { getToken } from "~/utils/token";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";

const DonationScreen = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: donations, isLoading } = useGetAllDonationsQuery(
    { page, limit, date: new Date().toString() },
    { refetchOnMountOrArgChange: true }
  );

  const handleDownloadReceipt = async (donationId: string, reference: string) => {
    setDownloadingId(donationId);
    try {
      const token = await getToken();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.cmdanigeria.net";
      const file = new File(Paths.cache, `CMDA-Donation-Receipt-${reference}.pdf`);
      
      // Download the file using fetch
      const response = await fetch(`${baseUrl}/donations/${donationId}/receipt`, {
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
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Donation Receipt',
        });
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
        <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 4 }]}>Donation History</Text>

        <View style={styles.tableHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Reference</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Total Amount</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.tableHeaderText}>Status</Text>
          </View>
          <View style={{ width: 60, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Receipt</Text>
          </View>
        </View>
        
        {donations?.items?.length ? (
          donations?.items?.map((don: any, n: number) => (
            <View
              key={don._id}
              style={[
                {
                  backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                  paddingVertical: (n + 1) % 2 ? 2 : 12,
                },
              ]}
            >
              <View style={styles.tableItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tableItemText}> {formatDate(don.createdAt).date}</Text>
                  <Text style={styles.tableItemText}>{don.reference}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.tableItemText}>{formatCurrency(don.totalAmount, don.currency)}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text style={[styles.tableItemText, { color: don.isPaid ? palette.success : palette.warning }]} numberOfLines={1}>
                    {don.isPaid ? "Paid" : "Pending"}
                  </Text>
                  {don.frequency && (
                    <Text style={[styles.tableItemText, { fontSize: 10 }]} numberOfLines={1}>
                      {don.frequency}
                    </Text>
                  )}
                </View>
                <View style={{ width: 60, alignItems: "center" }}>
                  {don.isPaid ? (
                    <TouchableOpacity
                      onPress={() => handleDownloadReceipt(don._id, don.reference)}
                      disabled={downloadingId === don._id}
                      style={styles.downloadButton}
                    >
                      {downloadingId === don._id ? (
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
              <View style={{ marginTop: 4, paddingHorizontal: 8 }}>
                <Text style={styles.tableItemText}>
                  {don.areasOfNeed
                    .map((x: any) => x.name + " - " + formatCurrency(x.amount, don.currency))
                    .join(", ")}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <EmptyData title="Donation Records" />
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: palette.onPrimary,
    ...typography.textSm,
    ...typography.fontSemiBold,
  },
});

export default DonationScreen;
