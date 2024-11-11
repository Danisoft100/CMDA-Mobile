import { StyleSheet, Text, View } from "react-native";
import React from "react";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import { palette, typography } from "~/theme";
import TextField from "~/components/form/TextField";
import { selectCart } from "~/store/slices/cartSlice";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useForm } from "react-hook-form";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import { usePayOrderSessionMutation } from "~/store/api/productsApi";

const StoreCheckoutScreen = ({ navigation }: any) => {
  const { cartItems, totalPrice } = useSelector(selectCart);
  const { user } = useSelector(selectAuth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      shippingContactName: user?.fullName,
      shippingContactPhone: user?.phone,
      shippingContactEmail: user?.email,
    },
  });

  const [payOrderSession, { isLoading }] = usePayOrderSessionMutation();

  const handlePay = (payload: any) => {
    payload = {
      ...payload,
      totalAmount: +totalPrice,
      products: cartItems.map((item: any) => ({
        product: item._id,
        quantity: item.quantity,
        size: item.selected?.size || null,
        color: item.selected?.color
          ? item.additionalImages?.find((x: any) => x.color == item.selected?.color)?.name
          : null,
      })),
    };

    payOrderSession(payload)
      .unwrap()
      .then((res) => {
        navigation.navigate("more-store-payment", { checkoutUrl: res.checkout_url, paymentFor: "order" });
      });
  };

  return (
    <AppKeyboardAvoidingView gap={12}>
      <Text style={[typography.textXl, typography.fontBold]}>Shipping Details</Text>
      <View style={{ gap: 8 }}>
        <TextField label="shippingContactName" control={control} errors={errors} required />
        <TextField label="shippingContactPhone" control={control} errors={errors} required keyboardType="phone-pad" />
        <TextField label="shippingContactEmail" control={control} errors={errors} required />
        <TextField
          numberOfLines={3}
          multiline
          minHeight={64}
          label="shippingAddress"
          control={control}
          errors={errors}
          required
        />
      </View>
      <Text style={[typography.textXl, typography.fontBold]}>Order Summary</Text>
      <View style={{ paddingVertical: 4, gap: 12, marginBottom: 24 }}>
        {cartItems.map((item: any, n: number) => (
          <View
            key={item._id}
            style={[
              styles.tableItem,
              {
                alignItems: "center",
                backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                paddingVertical: (n + 1) % 2 ? 2 : 12,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.tableItemText, typography.fontSemiBold]}>{item.quantity}</Text>
            </View>
            <View style={{ flex: 3 }}>
              <Text style={[styles.tableItemText, typography.fontSemiBold]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.tableItemText}>({formatCurrency(item.price)})</Text>
              {item?.selected?.size || item?.selected?.color ? (
                <Text style={styles.tableItemText}>
                  {[
                    item?.selected?.size,
                    item?.selected?.color
                      ? item.additionalImages.find((x: any) => x.color === item?.selected?.color)?.name
                      : false,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              ) : null}
            </View>
            <View style={{ flex: 2, alignItems: "flex-end" }}>
              <Text style={[styles.tableItemText, typography.textBase, typography.fontSemiBold]}>
                {formatCurrency(item.quantity * item.price)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.tableItem, { justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }]}>
        <Text style={[typography.textBase, typography.fontSemiBold]}>Total</Text>
        <Text style={[typography.text2xl, typography.fontBold]}>{formatCurrency(totalPrice)}</Text>
      </View>
      <Button label={"Pay " + formatCurrency(totalPrice)} onPress={handleSubmit(handlePay)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  table: { flex: 1 },
  tableItem: { flexDirection: "row", gap: 12, paddingHorizontal: 8 },
  tableItemText: { color: palette.greyDark, ...typography.textSm },
});

export default StoreCheckoutScreen;
