import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConferenceCard from "~/components/events/ConferenceCard";
import Button from "~/components/form/Button";
import { useGetPublicConferencesQuery } from "~/store/api/eventsApi";
import { palette, typography } from "~/theme";

const PublicConferencesScreen = ({ navigation }: any) => {
  const [page, setPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const { data, isLoading, isFetching, error, refetch } = useGetPublicConferencesQuery({ page, limit: 10, searchBy });

  useEffect(() => {
    const nextItems = data?.items || [];
    setItems((current) => {
      const combined = page === 1 ? nextItems : [...current, ...nextItems];
      return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
    });
  }, [data?.items, page]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [searchBy]);

  return (
    <SafeAreaView style={styles.wrapper} edges={["bottom"]}>
      <View style={styles.intro}>
        <Text style={styles.title}>CMDA Conferences</Text>
        <Text style={styles.subtitle}>Browse upcoming conferences. Sign in or create an account to register.</Text>
        <TextInput style={styles.search} value={searchBy} onChangeText={setSearchBy} placeholder="Search conferences…" placeholderTextColor={palette.grey} />
      </View>
      {isLoading && page === 1 ? <ActivityIndicator style={styles.loader} size="large" color={palette.primary} /> : null}
      {error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>Conferences could not be loaded.</Text>
          <Button label="Try Again" onPress={refetch} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("sign-in")}>
              <ConferenceCard
                width="auto"
                title={item.name}
                date={item.eventDateTime}
                image={item.featuredImageUrl}
                type={item.eventType}
                location={item.linkOrLocation}
                description={item.description}
                conference={{
                  type: item.conferenceConfig?.conferenceType,
                  zone: item.conferenceConfig?.zone,
                  region: item.conferenceConfig?.region,
                  registrationStatus: item.registrationStatus,
                  isPaid: item.isPaid,
                  paymentPlans: item.paymentPlans,
                }}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No conferences found.</Text> : null}
          ListFooterComponent={data?.meta?.currentPage < data?.meta?.totalPages ? <Button label="Load More" onPress={() => setPage((value) => value + 1)} loading={isFetching} /> : null}
        />
      )}
      <View style={styles.actions}>
        <Button label="Sign In to Register" onPress={() => navigation.navigate("sign-in")} style={{ flex: 1 }} />
        <Button label="Create Account" variant="outlined" onPress={() => navigation.navigate("sign-up")} style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: palette.background },
  intro: { padding: 16, gap: 6 },
  title: { ...typography.text2xl, ...typography.fontBold, color: palette.primary },
  subtitle: { ...typography.textSm, color: palette.greyDark },
  search: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.greyLight, borderRadius: 8, padding: 12, marginTop: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  loader: { marginTop: 60 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 },
  emptyText: { ...typography.textBase, color: palette.grey, textAlign: "center", marginTop: 40 },
  errorText: { ...typography.textBase, color: palette.error, textAlign: "center" },
  actions: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 8, padding: 12, backgroundColor: palette.white },
});

export default PublicConferencesScreen;
