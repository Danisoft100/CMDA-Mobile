import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGetAllSubscriptionsQuery } from "~/store/api/paymentsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";

const SubscriptionScreen = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: subscriptions, isLoading } = useGetAllSubscriptionsQuery(
    { page, limit },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
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
            <Text style={styles.tableHeaderText}>Sub. Date</Text>
            <Text style={styles.tableHeaderText}>Expiry Date</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
          {subscriptions?.items?.length ? (
            subscriptions?.items?.map((sub: any, n: number) => (
              <TouchableOpacity
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
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {formatCurrency(sub.amount)}
                  </Text>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {sub.frequency}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text style={styles.tableItemText}>{formatDate(sub.createdAt).date}</Text>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {formatDate(sub.expiryDate).date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={[typography.textBase]}>No subscription record to display</Text>
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

export default SubscriptionScreen;
