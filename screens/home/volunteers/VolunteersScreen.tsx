import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import { useGetVolunteerJobsQuery } from "~/store/api/volunteerApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const VolunteersScreen = ({ navigation }: any) => {
  const [volunteerships, setVolunteerships] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const { data: volunteerJobs, isLoading } = useGetVolunteerJobsQuery({ page, limit: 10, searchBy });

  useEffect(() => {
    if (volunteerJobs) {
      setVolunteerships((prevVols) => {
        const combinedVols = [...prevVols, ...volunteerJobs.items];
        const uniqueVols = Array.from(new Set(combinedVols.map((vol) => vol._id))).map((_id) =>
          combinedVols.find((vol) => vol._id === _id)
        );
        return uniqueVols;
      });

      setTotalPages(volunteerJobs.meta?.totalPages);
    }
  }, [volunteerJobs]);

  return (
    <AppContainer gap={20}>
      <SearchBar placeholder="Search opportunites..." onSearch={(v) => setSearchBy(v)} />

      <View style={{ gap: 16 }}>
        {volunteerships.map((job: any) => (
          <TouchableOpacity
            key={job._id}
            style={styles.jobCard}
            onPress={() => navigation.navigate("home-volunteers-single", { id: job._id })}
          >
            <FontAwesome6 name="briefcase-medical" size={36} color={palette.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.textBase, typography.fontSemiBold]} numberOfLines={1}>
                {job?.title}
              </Text>
              <Text style={[typography.textSm]}>{job?.companyLocation}</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={20} color={palette.greyLight} />
          </TouchableOpacity>
        ))}
      </View>

      <View>
        <Button
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          loading={isLoading}
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
