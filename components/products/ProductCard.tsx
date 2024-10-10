import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";
import { formatCurreny } from "~/utils/currencyFormatter";

const ProductCard = ({ name, description, price, image, width = 300, style }: any) => {
  return (
    <View style={[styles.card, { width }, style]}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {description}
        </Text>
        <Text style={[typography.textXl, typography.fontBold]}>{formatCurreny(price)}</Text>
      </View>
    </View>
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
    height: 160,
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
    marginBottom: 4,
  },
  subtitle: {
    color: palette.greyDark,
    ...typography.textXs,
  },
});

export default ProductCard;
