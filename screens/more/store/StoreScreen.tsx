import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ProductCard from "~/components/products/ProductCard";
import { useGetAllProductsQuery } from "~/store/api/productsApi";
import { palette, typography } from "~/theme";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";

const StoreScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");

  const {
    data: allProducts,
    isLoading: loadingProducts,
    isFetching,
  } = useGetAllProductsQuery({ page, limit: 12, searchBy });

  useEffect(() => {
    if (allProducts) {
      setProducts((prevProducts: any[]) => {
        const combinedProducts = [...prevProducts, ...allProducts.items];
        // Use Set to remove duplicate objects based on their IDs
        const uniqueProducts = Array.from(new Set(combinedProducts.map((res) => res._id))).map((id) =>
          combinedProducts.find((res) => res._id === id)
        );
        return uniqueProducts;
      });

      setTotalPages(allProducts.meta.totalPages);
    }
  }, [allProducts]);

  const STORE_MENU = [
    { icon: "cart", screen: "more-store-card", title: "Cart" },
    { icon: "clipboard-text-clock-outline", screen: "more-store-orders", title: "Order History" },
  ];

  return (
    <AppContainer gap={20}>
      <SearchBar placeholder="Search products..." onSearch={(v) => setSearchBy(v)} />

      <View style={{ gap: 8 }}>
        {STORE_MENU.map((menu: any, idx: number) => (
          <TouchableOpacity key={idx} style={styles.linkCard} onPress={() => navigation}>
            <MCIcons name={menu.icon} size={20} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { flex: 1 }]}>{menu.title}</Text>
            <MCIcons name="chevron-right" size={20} color={palette.greyDark} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ gap: 16 }}>
        {products.map((prod: any) => (
          <ProductCard
            key={prod._id}
            image={prod.featuredImageUrl}
            name={prod.name}
            description={prod?.description}
            price={prod?.price}
            width="auto"
          />
        ))}
      </View>

      <View>
        <Button
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          loading={loadingProducts || isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.onPrimary,
    padding: 14,
    borderRadius: 12,
  },
});

export default StoreScreen;
