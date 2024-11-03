import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { useGetSingleOrderQuery } from "~/store/api/productsApi";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import { formatDate } from "~/utils/dateFormatter";
import Octicons from "@expo/vector-icons/Octicons";
import capitalizeWords from "~/utils/capitalizeWords";

const StoreSingleOrderScreen = ({ route }: any) => {
  const { id } = route?.params;
  const { data: order = {} } = useGetSingleOrderQuery(id, { skip: !id, refetchOnMountOrArgChange: true });

  const StatusColor: any = {
    pending: palette.warning,
    shipped: palette.primary,
    delivered: palette.success,
    canceled: palette.error,
  };

  const DETAILS = useMemo(
    () => ({
      status: order.status,
      paymentReference: order.paymentReference,
      orderedOn: formatDate(order.createdAt).date + " || " + formatDate(order.createdAt).time,
      totalAmount: formatCurrency(order.totalAmount),
      shippingContactName: order.shippingContactName,
      shippingContactPhone: order.shippingContactPhone,
      shippingContactEmail: order.shippingContactEmail,
      shippingAddress: order.shippingAddress,
    }),
    [order]
  );

  const OrderTimeline = ({ status, date, comment }: any) => (
    <View style={styles.timeLineContainer}>
      <View style={styles.timeLineDot}>
        <Octicons name="dot-fill" size={24} color={palette.primary} />
      </View>
      <View style={{ flex: 1, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={[typography.textBase, typography.fontBold, { textTransform: "uppercase" }]}>{status}</Text>
          <Text style={[typography.textBase, typography.fontMedium]}>
            {formatDate(date).date + " || " + formatDate(date).time}
          </Text>
        </View>
        <Text style={[typography.textBase, typography.fontMedium]}>{comment}</Text>
      </View>
    </View>
  );

  return (
    <AppContainer gap={12}>
      <View style={{ gap: 4 }}>
        <Text style={[typography.textLg, typography.fontBold]}>Order Timeline</Text>
        <View style={styles.card}>
          <OrderTimeline
            status="CREATED"
            comment={`Your order has been created successfully.`}
            date={order?.createdAt}
          />
          {order.orderTimeline?.map((event: any, index: number) => (
            <OrderTimeline key={index} status={event?.status} comment={event?.comment} date={event?.date} />
          ))}
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={[typography.textLg, typography.fontBold]}>Order Details</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {Object.entries(DETAILS).map(([key, value]) => (
              <View
                key={key}
                style={{
                  flexBasis: ["shippingContactEmail", "shippingAddress"].includes(key) ? "100%" : "47%",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    typography.textXs,
                    typography.fontSemiBold,
                    { color: palette.grey, textTransform: "uppercase", marginBottom: 2 },
                  ]}
                >
                  {capitalizeWords(key)}
                </Text>
                <Text
                  style={[
                    typography.textSm,
                    typography.fontMedium,
                    key == "status" && { color: StatusColor[order?.status], textTransform: "uppercase" },
                  ]}
                >
                  {value || "N/A"}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ marginVertical: 8}}>
            <Text
              style={[
                typography.textXs,
                typography.fontSemiBold,
                { color: palette.grey, textTransform: "uppercase", marginBottom: 4 },
              ]}
            >
              Products
            </Text>
            {order.products?.map((item: any, n: number) => (
              <View
                key={item._id}
                style={[
                  styles.tableItem,
                  {
                    alignItems: "center",
                    backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                    paddingVertical: (n + 1) % 2 ? 6 : 12,
                  },
                ]}
              >
                <View style={{ flex: 0.5 }}>
                  <Text style={[styles.tableItemText, typography.fontSemiBold]}>{item.quantity}</Text>
                </View>
                <View style={{ flex: 3, flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <Image
                    source={{ uri: item.product?.featuredImageUrl }}
                    style={{ height: 36, width: 36, borderRadius: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tableItemText, typography.fontSemiBold]} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.tableItemText}>({formatCurrency(item.product.price)})</Text>
                    {item?.selected?.size || item?.selected?.color ? (
                      <Text style={styles.tableItemText}>
                        {[
                          item?.size,
                          item?.color
                            ? item.additionalImages.find((x: any) => x.color === item?.selected?.color)?.name
                            : false,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={{ flex: 2, alignItems: "flex-end" }}>
                  <Text style={[styles.tableItemText, typography.textBase, typography.fontSemiBold]}>
                    {formatCurrency(item.quantity * item.product.price)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLineContainer: {
    borderLeftWidth: 2,
    borderLeftColor: palette.grey,
    flexDirection: "row",
    gap: 12,
    marginLeft: 8,
  },
  timeLineDot: {
    height: 32,
    width: 32,
    borderRadius: 24,
    backgroundColor: palette.onPrimaryContainer,
    marginLeft: -17,
    marginTop: -4,
    justifyContent: "center",
    alignItems: "center",
  },
  tableItem: { flexDirection: "row", gap: 12, paddingHorizontal: 8 },
  tableItemText: { color: palette.greyDark, ...typography.textSm },
});

export default StoreSingleOrderScreen;
