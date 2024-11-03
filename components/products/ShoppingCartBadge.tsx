import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import { selectCart } from "~/store/slices/cartSlice";
import { useSelector } from "react-redux";

const ShoppingCartBadge = ({ navigation }: any) => {
  const { cartItems } = useSelector(selectCart);

  return (
    <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate("more-store-cart")}>
      <MCIcon name="cart" size={28} color={palette.primary} />
      {cartItems?.length > 0 ? (
        <View style={styles.badgeContainer}>
          <Text style={[typography.textXs, typography.fontSemiBold, { color: palette.white }]}>{cartItems.length}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: palette.secondary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ShoppingCartBadge;
