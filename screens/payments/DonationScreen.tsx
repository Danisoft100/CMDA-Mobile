import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EmptyData from "~/components/EmptyData";
import { useGetAllDonationsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";

const DonationScreen = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: donations, isLoading } = useGetAllDonationsQuery(
    { page, limit, date: new Date().toString() },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
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
            <Text style={styles.tableHeaderText}>Frequency</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
          {donations?.items?.length ? (
            donations?.items?.map((don: any, n: number) => (
              <TouchableOpacity
                key={don._id}
                style={[
                  ,
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
                    <Text style={styles.tableItemText} numberOfLines={1}>
                      {don.frequency || "One-time"}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 4, paddingHorizontal: 8 }}>
                  <Text style={styles.tableItemText}>
                    {don.areasOfNeed
                      .map((x: any) => x.name + " - " + formatCurrency(x.amount, don.currency))
                      .join(", ")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptyData title="Donation Records" />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
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
});

export default DonationScreen;
