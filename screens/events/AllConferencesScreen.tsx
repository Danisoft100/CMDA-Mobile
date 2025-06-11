import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, TextInput } from "react-native";
import EmptyData from "~/components/EmptyData";
import ConferenceCard from "~/components/events/ConferenceCard";
import ConferenceFilterModal from "~/components/events/ConferenceFilterModal";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import { useGetAllConferencesQuery } from "~/store/api/eventsApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Toast from "react-native-toast-message";
import { getNetworkErrorMessage, isNetworkError } from "~/utils/networkUtils";

const AllConferencesScreen = () => {
  const navigation: any = useNavigation();

  const [allConferences, setAllConferences] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    eventDate: "",
    membersGroup: "",
    eventType: "",
    conferenceType: "",
    zone: "",
    region: "",
  });

  const {
    data: conferences,
    isLoading,
    isFetching,
    error,
  } = useGetAllConferencesQuery(
    { 
      page, 
      limit: 10, 
      searchBy: searchBy || undefined, 
      fromToday: true, 
      ...filters
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (conferences) {
      if (page === 1) {
        // Reset conferences for new search/filter
        setAllConferences(conferences.items);
      } else {
        // Append for pagination
        setAllConferences((prevConfs: any[]) => {
          const combinedConferences = [...prevConfs, ...conferences.items];
          const uniqueConferences = Array.from(new Set(combinedConferences.map((conf) => conf._id))).map((_id) =>
            combinedConferences.find((conf) => conf._id === _id)
          );
          return uniqueConferences;
        });
      }
      setTotalPages(conferences.meta?.totalPages);
    }
  }, [conferences, page]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
    setAllConferences([]);
  }, [searchBy, filters]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    setAllConferences([]);
  };

  const handleSearchChange = (text: string) => {
    setSearchBy(text);
  };

  const navigateToConference = (conference: any) => {
    if (conference.isConference) {
      navigation.navigate("single-conference", { slug: conference.slug });
    } else {
      navigation.navigate("events-single", { slug: conference.slug });
    }
  };
  if (error) {
    const errorMessage = getNetworkErrorMessage(error);
    const isNetwork = isNetworkError(error);
    
    return (
      <View style={styles.errorContainer}>
        <FontAwesome6 
          name={isNetwork ? "wifi" : "exclamation-triangle"} 
          size={48} 
          color={palette.error} 
        />
        <Text style={styles.errorTitle}>
          {isNetwork ? "Connection Error" : "Something went wrong"}
        </Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Button 
          label="Retry" 
          onPress={() => {
            setPage(1);
            setAllConferences([]);
          }} 
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      {/* Search and Filter Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome6 name="magnifying-glass" size={16} color={palette.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conferences..."
            value={searchBy}
            onChangeText={handleSearchChange}
            placeholderTextColor={palette.grey}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilter(true)}
        >
          <FontAwesome6 name="filter" size={16} color={palette.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
        {isLoading && page === 1 ? (
          <Loading marginVertical={32} />
        ) : allConferences?.length ? (
          <View style={{ gap: 8 }}>
            {allConferences.map((conf: any) => (
              <TouchableOpacity key={conf._id} onPress={() => navigateToConference(conf)}>
                <ConferenceCard
                  title={conf.name}
                  date={conf.eventDateTime}
                  image={conf.featuredImageUrl}
                  type={conf.eventType}
                  location={conf.linkOrLocation}
                  description={conf.description}
                  width="auto"
                  conference={{
                    type: conf.conferenceConfig?.type,
                    zone: conf.conferenceConfig?.zone,
                    region: conf.conferenceConfig?.region,
                    registrationStatus: conf.registrationStatus,
                    isPaid: conf.isPaid,
                    paymentPlans: conf.paymentPlans
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyData 
            title="No Conferences Found" 
            icon="calendar" 
            subtitle={searchBy || Object.values(filters).some(f => f) ? 
              "No conferences match your search criteria. Try adjusting your filters." : 
              "No upcoming conferences available at the moment."
            }
          />
        )}

        {allConferences?.length ? (
          <Button
            disabled={page === totalPages || isFetching}
            label={page === totalPages ? "All conferences loaded" : isFetching ? "Loading..." : "Load More"}
            loading={isFetching && page > 1}
            onPress={() => setPage((prev) => prev + 1)}
            style={[
              styles.loadMoreButton,
              (page === totalPages || isFetching) && { backgroundColor: palette.grey }
            ]}
          />
        ) : null}
      </ScrollView>

      {/* Filter Modal */}
      <ConferenceFilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.textBase,
    color: palette.black,
  },
  filterButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    ...typography.textBase,
    color: palette.grey,
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: 16,
    marginHorizontal: 16,
  },
});

export default AllConferencesScreen;
