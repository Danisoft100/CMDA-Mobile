import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import { useDispatch, useSelector } from "react-redux";
import { adjustItemQuantity, clearCart, selectCart } from "~/store/slices/cartSlice";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import Toast from "react-native-toast-message";
import { useRoles } from "~/utils/useRoles";

const StoreCartScreen = ({ navigation }: any) => {
  const { cartItems, totalPrice, totalPriceUSD } = useSelector(selectCart);
  const dispatch = useDispatch();

  const { isGlobalNetwork, roleCurrency } = useRoles();

  const handleQtyChange = (itemId: string, newQuantity: number) => {
    dispatch(adjustItemQuantity({ itemId, newQuantity }));
  };

  const handleClearAll = () => {
    dispatch(clearCart());
    Toast.show({ type: "success", text1: "Cart cleared!" });
  };

  return (
    <AppContainer>
      {!cartItems?.length ? (
        <EmptyData title="Empty Cart" subtitle="You currently have no item in your shopping cart" />
      ) : (
        <View>
          {cartItems.map((item: any) => (
            <View key={item._id} style={styles.cartItem}>
              <TouchableOpacity
                style={styles.cartItemRow}
                onPress={() => navigation.navigate("more-store-single", { slug: item.slug })}
              >
                <Image source={{ uri: item.featuredImageUrl }} style={styles.cartItemImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textLg, typography.fontSemiBold]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[typography.textSm]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[typography.textLg, typography.fontSemiBold]}>
                    {formatCurrency(isGlobalNetwork ? item.priceUSD : item.price, roleCurrency)}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cartItemActions}>
                <View style={[styles.cartItemRow, { marginBottom: 4 }]}>
                  <Text style={[typography.textBase, typography.fontMedium]}>Quantity:</Text>
                  <View style={styles.cartItemRow}>
                    <Button
                      icon="minus"
                      iconSize={16}
                      dense
                      variant="outlined"
                      style={styles.qtyActionBtn}
                      onPress={() => handleQtyChange(item._id, item?.quantity - 1)}
                    />
                    <Text style={[typography.textXl, typography.fontSemiBold, { paddingHorizontal: 4 }]}>
                      {item.quantity}
                    </Text>
                    <Button
                      icon="plus"
                      iconSize={16}
                      dense
                      variant="outlined"
                      style={styles.qtyActionBtn}
                      onPress={() => handleQtyChange(item._id, item?.quantity + 1)}
                    />
                  </View>
                </View>

                {item?.selected?.size || item?.selected?.color ? (
                  <View style={[styles.cartItemRow, { gap: 24 }]}>
                    {item?.selected?.size ? (
                      <View style={[styles.cartItemRow, { gap: 2 }]}>
                        <Text style={[typography.textBase, typography.fontMedium]}>Size:</Text>
                        <Text style={[typography.textBase, typography.fontSemiBold]}>{item?.selected?.size}</Text>
                      </View>
                    ) : null}
                    {item?.selected?.size ? (
                      <View style={[styles.cartItemRow, { gap: 2 }]}>
                        <Text style={[typography.textBase, typography.fontMedium]}>Color:</Text>
                        <Text style={[typography.textBase, typography.fontSemiBold]}>
                          {item.additionalImages?.find((x: any) => x.color === item?.selected?.color)?.name}
                        </Text>
                      </View>
                    ) : null}
                    <TouchableOpacity>
                      <Text
                        style={[
                          typography.textSm,
                          typography.fontSemiBold,
                          { color: palette.primary, textDecorationLine: "underline" },
                        ]}
                      >
                        CHANGE
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={[styles.cartItemRow, { justifyContent: "flex-end" }]}>
                  <Text style={[typography.textXl, typography.fontSemiBold]}>
                    {formatCurrency(item?.quantity * (isGlobalNetwork ? item?.priceUSD : item.price), roleCurrency)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={{ marginTop: 24 }}>
            <View
              style={[
                styles.cartItemRow,
                { justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 4 },
              ]}
            >
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>Clear All</Text>
              </TouchableOpacity>
              <Text style={[typography.text2xl, typography.fontBold]}>
                {formatCurrency(isGlobalNetwork ? totalPriceUSD : totalPrice, roleCurrency)}
              </Text>
            </View>
            <Button label="Proceed to Payment" onPress={() => navigation.navigate("more-store-checkout")} />
          </View>
        </View>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  cartItemRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  cartItemImage: {
    height: 80,
    width: 80,
    borderRadius: 12,
  },
  cartItemActions: {
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
    marginTop: 8,
    paddingTop: 8,
    paddingBottom: 2,
    paddingHorizontal: 8,
    gap: 4,
  },
  qtyActionBtn: { paddingVertical: 4, paddingHorizontal: 8, minHeight: 30 },
});

export default StoreCartScreen;
