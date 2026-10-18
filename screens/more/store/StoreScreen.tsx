import { usePagedResults } from "~/utils/usePagedResults";
import QueryFeedback from "~/components/QueryFeedback";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ProductCard from "~/components/products/ProductCard";
import { useGetAllProductsQuery } from "~/store/api/productsApi";
import { palette, typography } from "~/theme";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ShoppingCartBadge from "~/components/products/ShoppingCartBadge";
import { useRoles } from "~/utils/useRoles";
import { formatCurrency } from "~/utils/currencyFormatter";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StoreScreen = ({ navigation }: any) => {
  const [page, setPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");

  const { isGlobalNetwork, roleCurrency } = useRoles();

  const {
    currentData: allProducts,
    isLoading: loadingProducts,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllProductsQuery({
    feedbackHandled: true,
    page,
    limit: 12,
    searchBy,
  });

  const { items: products, totalPages } = usePagedResults(
    allProducts,
    page,
    JSON.stringify([searchBy]),
  );

  const insets = useSafeAreaInsets();

  const Header = () => (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 12,
        backgroundColor: palette.background,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MCIcons name="chevron-left" size={32} color={palette.black} />
        </TouchableOpacity>
        <Text style={[typography.textXl, typography.fontSemiBold]}>Store</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <ShoppingCartBadge navigation={navigation} />
        <TouchableOpacity
          style={[]}
          onPress={() => navigation.navigate("more-store-orders")}
        >
          <MCIcons
            name="clipboard-text-clock-outline"
            size={28}
            color={palette.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    navigation.setOptions({ header: Header });
  }, [navigation]);

  return (
    <AppContainer gap={20}>
      <SearchBar
        placeholder="Search products..."
        onSearch={(v) => {
          setPage(1);
          setSearchBy(v);
        }}
      />

      <QueryFeedback
        label="products"
        loading={isFetching && !products.length}
        error={isError ? error : undefined}
        empty={!isFetching && !isError && !products.length}
        onRetry={refetch}
      />
      <View style={{ gap: 16 }}>
        {products.map((prod: any) => (
          <ProductCard
            key={prod._id}
            image={prod.featuredImageUrl}
            name={prod.name}
            price={formatCurrency(
              isGlobalNetwork ? prod?.priceUSD : prod?.price,
              roleCurrency,
            )}
            width="auto"
            onPress={() =>
              navigation.navigate("more-store-single", { slug: prod.slug })
            }
          />
        ))}
      </View>

      <View>
        <Button
          disabled={page >= totalPages || isError}
          label={page >= totalPages ? "The End" : "Load More"}
          loading={loadingProducts || isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </View>
    </AppContainer>
  );
};

export default StoreScreen;
