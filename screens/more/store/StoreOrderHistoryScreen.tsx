import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AppContainer from "~/components/AppContainer";
import { useGetOrderHistoryQuery } from "~/store/api/productsApi";
import { palette, typography } from "~/theme";
import EmptyData from "~/components/EmptyData";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";

const StoreOrderHistoryScreen = ({ navigation }: any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchBy, setSearchBy] = useState("");
  const { data: orderHistory, isLoading } = useGetOrderHistoryQuery({ page, limit, searchBy });

  const StatusColor: any = {
    pending: palette.warning,
    shipped: palette.primary,
    delivered: palette.success,
    canceled: palette.error,
  };

  return (
    <AppContainer withScrollView={false}>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tableHeaderText}>Reference</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            <Text style={styles.tableHeaderText}>Total Items</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.tableHeaderText}>Status</Text>
            <Text style={styles.tableHeaderText}>Date</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
          {orderHistory?.items?.length ? (
            orderHistory?.items?.map((item: any, n: number) => (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.tableItem,
                  {
                    alignItems: "center",
                    backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                    paddingVertical: (n + 1) % 2 ? 6 : 12,
                  },
                ]}
                onPress={() => navigation.navigate("more-store-orders-single", { id: item._id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.tableItemText}>{item.paymentReference}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {formatCurrency(item.totalAmount)}
                  </Text>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {item.products?.reduce((acc: number, prod: any) => acc + prod.quantity, 0)} Item(s)
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.tableItemText,
                      typography.fontBold,
                      {
                        textTransform: "uppercase",
                        color: StatusColor[item.status] || palette.greyDark,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                  <Text style={styles.tableItemText} numberOfLines={1}>
                    {formatDate(item.createdAt).date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptyData title="Orders" />
            </View>
          )}
        </ScrollView>
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
});

export default StoreOrderHistoryScreen;
