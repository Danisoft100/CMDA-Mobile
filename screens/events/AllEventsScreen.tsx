import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import EmptyData from "~/components/EmptyData";
import EventCard from "~/components/events/EventCard";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import { useGetAllEventsQuery } from "~/store/api/eventsApi";
import { typography } from "~/theme";

const AllEventsScreen = () => {
  const navigation: any = useNavigation();

  const [allEvents, setAllEvents] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState();
  const [openFilter, setOpenFilter] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [membersGroup, setMembersGroup] = useState("");
  const [eventType, setEventType] = useState("");
  const {
    data: events,
    isLoading,
    isFetching,
  } = useGetAllEventsQuery(
    { page, limit: 10, searchBy, fromToday: true, eventDate, membersGroup, eventType },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (events) {
      setAllEvents((prevEvts: any[]) => {
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
      {isLoading || isFetching ? (
        <Loading marginVertical={32} />
      ) : allEvents?.length ? (
        <View style={{ gap: 8 }}>
          {allEvents.map((evt: any) => (
            <TouchableOpacity key={evt._id} onPress={() => navigation.navigate("events-single", { slug: evt.slug })}>
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
      ) : (
        <EmptyData title="Events" icon="calendar" />
      )}

      {allEvents?.length ? (
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

export default AllEventsScreen;
