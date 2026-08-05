import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl } from "react-native";
import { Paths, File } from "expo-file-system";
import EmptyData from "~/components/EmptyData";
import { useGetAllDonationsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";
import { downloadAuthenticatedFile, safeReceiptFilename } from "~/utils/authenticatedDownload";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";
import { saveReceiptPdf, shareReceiptPdf } from "~/utils/receiptFiles";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";

const DonationScreen = () => {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [allDonations, setAllDonations] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: donations, isLoading, isFetching, isError, refetch } = useGetAllDonationsQuery(
    { page, limit },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (!donations) return;
    const incoming = donations.items ?? [];
    setAllDonations((previous) => {
      const combined = page === 1 ? incoming : [...previous, ...incoming];
      return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
    });
    setTotalPages(donations.meta?.totalPages ?? 0);
  }, [donations, page]);

  const refresh = () => {
    if (page !== 1) setPage(1);
    else void refetch();
  };

  const handleDownloadReceipt = async (donationId: string, reference: string) => {
    setDownloadingId(donationId);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "https://cmdabackend-38258a63fa98.herokuapp.com";
      const filename = safeReceiptFilename(reference, donationId);
      const destination = new File(Paths.cache, `CMDA-Donation-Receipt-${filename}.pdf`);
      const file = await downloadAuthenticatedFile(
        `${baseUrl}/donations/${donationId}/receipt`,
        destination
      );
      
      const result = await saveReceiptPdf(file, `CMDA-Donation-Receipt-${filename}.pdf`, "Donation Receipt");
      if (result.status === "saved") {
        Alert.alert("Receipt saved", "The PDF was saved to the folder you selected.", [
          { text: "Share", onPress: () => void shareReceiptPdf(file, "Donation Receipt") },
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
        
        {isLoading && !allDonations.length ? (
          <Loading center marginVertical={48} />
        ) : isError && !allDonations.length ? (
          <View style={styles.feedback}>
            <EmptyData title="Donations unavailable" subtitle="Check your connection and try again." icon="alert-circle-outline" />
            <Button label="Try Again" onPress={refetch} />
          </View>
        ) : allDonations.length ? (
          allDonations.map((don: any, n: number) => (
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
                      accessibilityRole="button"
                      accessibilityLabel={`Download receipt ${don.reference}`}
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
        {page < totalPages ? (
          <Button label="Load More" onPress={() => setPage((current) => current + 1)} loading={isFetching && page > 1} style={{ marginTop: 12 }} />
        ) : null}
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
  feedback: { gap: 16 },
});

export default DonationScreen;
