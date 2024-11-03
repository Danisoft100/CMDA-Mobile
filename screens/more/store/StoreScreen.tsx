import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ProductCard from "~/components/products/ProductCard";
import { useGetAllProductsQuery } from "~/store/api/productsApi";
import { palette } from "~/theme";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ShoppingCartBadge from "~/components/products/ShoppingCartBadge";

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

  const HeaderRight = () => (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <ShoppingCartBadge navigation={navigation} />
      <TouchableOpacity style={[]} onPress={() => navigation.navigate("more-store-orders")}>
        <MCIcons name="clipboard-text-clock-outline" size={28} color={palette.primary} />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    navigation.setOptions({ headerRight: HeaderRight });
  }, [navigation]);

  return (
    <AppContainer gap={20}>
      <SearchBar placeholder="Search products..." onSearch={(v) => setSearchBy(v)} />

      <View style={{ gap: 16 }}>
        {products.map((prod: any) => (
          <ProductCard
            key={prod._id}
            image={prod.featuredImageUrl}
            name={prod.name}
            price={prod?.price}
            width="auto"
            onPress={() => navigation.navigate("more-store-single", { slug: prod.slug })}
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

export default StoreScreen;
