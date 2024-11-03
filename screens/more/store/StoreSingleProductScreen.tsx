import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useGetAllProductsQuery, useGetSingleProductQuery } from "~/store/api/productsApi";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { addItemToCart, removeItemFromCart, selectCart } from "~/store/slices/cartSlice";
import ShoppingCartBadge from "~/components/products/ShoppingCartBadge";

const StoreSingleProductScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const dispatch = useDispatch();

  const { data: product, isLoading } = useGetSingleProductQuery(slug);
  //   const { data: otherProducts, isLoading: loadingOthers } = useGetAllProductsQuery({ page: 1, limit: 10 });

  const [currentImage, setCurrentImage] = useState(product?.featuredImageUrl);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (product?.featuredImageUrl) {
      setCurrentImage(product?.featuredImageUrl);
    }
  }, [product]);

  const { cartItems } = useSelector(selectCart);

  const alreadyInCart = useMemo(() => {
    return cartItems?.some((item: any) => item._id === product?._id);
  }, [cartItems, product?._id]);

  const [addingItem, setAddingItem] = useState(false);
  const [removingItem, setRemovingItem] = useState(false);

  const handleAddItem = () => {
    if (product.sizes.length && !size) {
      return Toast.show({ type: "error", text1: "Please select a size" });
    }
    if (product.additionalImages.filter((x: any) => !!x.color).length && !color) {
      return Toast.show({ type: "error", text1: "Please select a color" });
    }
    setAddingItem(true);
    setTimeout(() => {
      dispatch(addItemToCart({ item: { ...product, selected: { color, size } }, quantity }));
      Toast.show({ type: "success", text1: "Added to cart!" });
      setAddingItem(false);
    }, 2000);
  };

  const handleRemoveItem = () => {
    setRemovingItem(true);
    setTimeout(() => {
      dispatch(removeItemFromCart(product?._id));
      Toast.show({ type: 'success', text1: "Removed from cart" });
      setRemovingItem(false);
    }, 2000);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ShoppingCartBadge navigation={navigation} />,
    });
  }, [navigation]);

  return (
    <AppContainer>
      {isLoading ? (
        <Text style={[typography.textLg, typography.fontMedium]}>Loading...</Text>
      ) : (
        <>
          <Image source={{ uri: currentImage }} style={styles.featImage} />
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
            {[{ imageUrl: product?.featuredImageUrl }]
              .concat(product?.additionalImages?.filter((x: any) => !!x.imageUrl))
              .map((x) => (
                <TouchableOpacity
                  key={x.imageUrl}
                  style={[
                    { borderRadius: 8, padding: 4 },
                    x.imageUrl == currentImage && { borderWidth: 2, borderColor: palette.primary },
                  ]}
                >
                  <Image style={{ height: 48, width: 48, borderRadius: 8 }} source={{ uri: x.imageUrl }} />
                </TouchableOpacity>
              ))}
          </View>

          <View style={[styles.card, { gap: 6 }]}>
            <Text style={[typography.text2xl, typography.fontBold]}>{product?.name}</Text>
            <Text style={[typography.text2xl, typography.fontSemiBold]}>{formatCurrency(product?.price)}</Text>
            <Text style={[typography.textBase, typography.fontMedium]}>{product?.description}</Text>
            <View>
              <Text style={[typography.textBase, typography.fontSemiBold]}>Brand</Text>
              <Text style={[typography.textBase, typography.fontMedium]}>{product?.brand}</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={[typography.textBase, typography.fontSemiBold]}>Quantity</Text>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Button
                  icon="minus"
                  iconSize={20}
                  dense
                  variant="outlined"
                  onPress={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                />
                <Text style={[typography.text2xl, typography.fontSemiBold, { paddingHorizontal: 4 }]}>{quantity}</Text>
                <Button
                  icon="plus"
                  iconSize={20}
                  dense
                  variant="outlined"
                  onPress={() => setQuantity((prev) => prev + 1)}
                />
              </View>
            </View>
            {product?.sizes?.length ? (
              <View style={{ marginVertical: 8 }}>
                <Text style={[typography.textBase, typography.fontSemiBold]}>Sizes</Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {["M", "L", "XL", "XXL"].map((x) => (
                    <Button
                      key={x}
                      label={x}
                      dense
                      variant={size == x ? "filled" : "outlined"}
                      style={{ paddingHorizontal: 16 }}
                      onPress={() => setSize(x)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            {product?.additionalImages?.filter((x: any) => !!x.color).length ? (
              <View style={{ marginVertical: 8 }}>
                <Text style={[typography.textBase, typography.fontSemiBold]}>Colors</Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  {product?.additionalImages
                    ?.filter((x: any) => !!x.color)
                    .map((x: any) => (
                      <View key={x} style={{ alignItems: "center", gap: 2 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setColor(x.color);
                            setCurrentImage(x.imageUrl);
                          }}
                          style={[
                            { borderWidth: 3, borderRadius: 24, padding: 2 },
                            { borderColor: color == x ? palette.primary : palette.white },
                          ]}
                        >
                          <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: x.color }} />
                        </TouchableOpacity>
                        <Text style={[typography.textSm, typography.fontMedium, { textTransform: "capitalize" }]}>
                          {x.name}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            ) : null}

            <View style={{ gap: 8, marginVertical: 16 }}>
              <Button
                icon="cart-plus"
                label={alreadyInCart ? "Already Added" : "Add to Cart"}
                onPress={handleAddItem}
                loading={addingItem}
                disabled={alreadyInCart}
              />
              {alreadyInCart ? (
                <Button variant="outlined" label="Remove from Cart" loading={removingItem} onPress={handleRemoveItem} />
              ) : null}
            </View>
          </View>
        </>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  featImage: {
    minHeight: 300,
    maxHeight: 300,
    width: "100%",
    marginHorizontal: "auto",
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 24,
  },
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
});

export default StoreSingleProductScreen;
