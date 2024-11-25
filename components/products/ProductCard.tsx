import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { palette, typography } from "~/theme";

interface IProductCard {
  name: string;
  price: string;
  image: string;
  width: string | number;
  style?: any;
  onPress?: () => void;
}

const ProductCard = ({ name, price, image, width = 300, style, onPress = () => {} }: IProductCard) => {
  return (
    <TouchableOpacity style={[styles.card, { width }, style]} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[typography.textXl, typography.fontBold]}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderColor: palette.greyLight,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    backgroundColor: palette.onPrimary,
    height: 144,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    flex: 1,
  },
  subtitle: {
    color: palette.greyDark,
    ...typography.textXs,
  },
});

export default ProductCard;
