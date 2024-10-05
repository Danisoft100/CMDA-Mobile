import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGetAllDonationsQuery, useGetAllSubscriptionsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurreny } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";

const DonationScreen = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: donations, isLoading } = useGetAllDonationsQuery({ page, limit });

  return (
    <ScrollView style={{ gap: 16 }}>
      <View style={styles.table}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 4 }]}>Donation History</Text>

        <View style={styles.tableHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Reference</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            <Text style={styles.tableHeaderText}>Frequency</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.tableHeaderText}>Area of</Text>
            <Text style={styles.tableHeaderText}>Need</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
          {donations?.items?.length ? (
            donations?.items?.map((don: any, n: number) => (
              <TouchableOpacity
                key={don._id}
                style={[
                  styles.tableItem,
                  {
                    backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                    paddingVertical: (n + 1) % 2 ? 2 : 12,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.tableItemText}> {formatDate(don.createdAt).date}</Text>
                  <Text style={styles.tableItemText}>{don.reference}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.tableItemText}>{formatCurreny(don.amount)}</Text>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {don.frequency || "One-time"}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text style={styles.tableItemText} numberOfLines={2}>
                    {don.areasOfNeed || "N/A"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={[typography.textBase]}>No donation record to display</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScrollView>
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
