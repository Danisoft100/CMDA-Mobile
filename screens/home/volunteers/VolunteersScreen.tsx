import { usePagedResults } from "~/utils/usePagedResults";
import QueryFeedback from "~/components/QueryFeedback";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import { useGetVolunteerJobsQuery } from "~/store/api/volunteerApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const VolunteersScreen = ({ navigation }: any) => {
  const [page, setPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const {
    currentData: volunteerJobs,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetVolunteerJobsQuery({
    feedbackHandled: true,
    page,
    limit: 10,
    searchBy,
  });

  const { items: volunteerships, totalPages } = usePagedResults(
    volunteerJobs,
    page,
    JSON.stringify([searchBy]),
  );

  return (
    <AppContainer gap={20}>
      <SearchBar
        placeholder="Search opportunites..."
        onSearch={(v) => {
          setPage(1);
          setSearchBy(v);
        }}
      />

      <QueryFeedback
        label="volunteer opportunities"
        loading={isFetching && !volunteerships.length}
        error={isError ? error : undefined}
        empty={!isFetching && !isError && !volunteerships.length}
        onRetry={refetch}
      />
      <View style={{ gap: 16 }}>
        {volunteerships.map((job: any) => (
          <TouchableOpacity
            key={job._id}
            style={styles.jobCard}
            onPress={() =>
              navigation.navigate("home-volunteers-single", { id: job._id })
            }
          >
            <FontAwesome6
              name="briefcase-medical"
              size={36}
              color={palette.primary}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={[typography.textBase, typography.fontSemiBold]}
                numberOfLines={1}
              >
                {job?.title}
              </Text>
              <Text style={[typography.textSm]}>{job?.companyLocation}</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={20}
              color={palette.greyLight}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View>
        <Button
          disabled={page >= totalPages || isError}
          label={page >= totalPages ? "The End" : "Load More"}
          loading={isLoading || isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.white,
    borderColor: palette.greyLight,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
  },
});

export default VolunteersScreen;
