import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { palette } from "~/theme";
import { useGetRegisteredEventsQuery } from "~/store/api/eventsApi";
import EventCard from "~/components/events/EventCard";
import Button from "~/components/form/Button";
import { useNavigation } from "@react-navigation/native";
import QueryFeedback from "~/components/QueryFeedback";
import { usePagedResults } from "~/utils/usePagedResults";

const RegisteredEventsScreen = ({
  conferencesOnly = false,
}: {
  conferencesOnly?: boolean;
}) => {
  const navigation: any = useNavigation();

  const [page, setPage] = useState(1);

  const {
    currentData: events,
    refetch,
    isFetching,
    isError,
    error,
  } = useGetRegisteredEventsQuery(
    {
      page,
      limit: 10,
      feedbackHandled: true,
      ...(conferencesOnly ? { isConference: true } : {}),
    },
    { refetchOnMountOrArgChange: true },
  );
  const [generation, setGeneration] = useState(0);
  const { items: registeredEvents, totalPages } = usePagedResults(
    events,
    page,
    `${conferencesOnly}:${generation}`,
  );

  // Pull down to refresh
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    if (page !== 1) {
      setGeneration((previous) => previous + 1);
      setPage(1);
      return;
    }
    setRefreshing(true);
    setGeneration((previous) => previous + 1);
    refetch().finally(() => setRefreshing(false));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={palette.white}
          progressBackgroundColor={palette.primary}
          colors={[palette.white]}
        />
      }
    >
      <QueryFeedback
        label={conferencesOnly ? "registered conferences" : "registered events"}
        loading={isFetching && !registeredEvents.length}
        error={isError ? error : undefined}
        empty={!isFetching && !isError && !registeredEvents.length}
        onRetry={refetch}
      />
      {registeredEvents?.length ? (
        <View style={{ gap: 8 }}>
          {registeredEvents.map((evt: any) => (
            <TouchableOpacity
              key={evt._id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${evt.name}`}
              onPress={() =>
                navigation.navigate(
                  evt.isConference ? "single-conference" : "events-single",
                  { slug: evt.slug },
                )
              }
            >
              <EventCard
                title={evt.name}
                date={evt.eventDateTime}
                image={evt.featuredImageUrl}
                type={evt.eventType}
                location={evt.linkOrLocation}
                description={evt.description}
                width="auto"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {registeredEvents?.length ? (
        <Button
          disabled={page >= totalPages || isError}
          label={page >= totalPages ? "The End" : "Load More"}
          loading={isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      ) : null}
    </ScrollView>
  );
};

export default RegisteredEventsScreen;
