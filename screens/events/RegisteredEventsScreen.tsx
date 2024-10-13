import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { typography } from "~/theme";
import { useGetRegisteredEventsQuery } from "~/store/api/eventsApi";
import EventCard from "~/components/events/EventCard";
import Button from "~/components/form/Button";
import EmptyData from "~/components/EmptyData";

const RegisteredEventsScreen = () => {
  const [registeredEvents, setRegisteredEvents] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState();
  const [openFilter, setOpenFilter] = useState(false);

  const { data: events, isLoading } = useGetRegisteredEventsQuery({ page, limit: 10, searchBy });

  useEffect(() => {
    if (events) {
      setRegisteredEvents((prevEvts: any[]) => {
        const combinedEvents = [...prevEvts, ...events.items];
        const uniqueEvents = Array.from(new Set(combinedEvents.map((evt) => evt._id))).map((_id) =>
          combinedEvents.find((evt) => evt._id === _id)
        );
        return uniqueEvents;
      });
      setTotalPages(events.meta?.totalPages);
    }
  }, [events]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
      {isLoading ? (
        <Text style={[typography.textBase, typography.fontMedium, { marginVertical: 24 }]}>Loading...</Text>
      ) : registeredEvents?.length ? (
        <View>
          {registeredEvents.map((evt: any) => (
            <View key={evt._id}>
              <EventCard
                title={evt.name}
                date={evt.eventDateTime}
                image={evt.featuredImageUrl}
                type={evt.eventType}
                location={evt.linkOrLocation}
                description={evt.description}
                width="auto"
              />
            </View>
          ))}
        </View>
      ) : (
        <EmptyData title="Registered Events" icon="calendar" />
      )}

      {registeredEvents?.length ? (
        <Button
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          loading={isLoading}
          onPress={() => setPage((prev) => prev + 1)}
        />
      ) : null}
    </ScrollView>
  );
};

export default RegisteredEventsScreen;
