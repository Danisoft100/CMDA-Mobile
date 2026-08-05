import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import EmptyData from "~/components/EmptyData";
import EventCard from "~/components/events/EventCard";
import EventFilterModal from "~/components/events/EventFilterModal";
import EventsCalendar from "~/components/events/EventsCalendar";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import Loading from "~/components/Loading";
import { useGetAllEventsQuery } from "~/store/api/eventsApi";
import { palette, typography } from "~/theme";
import AppContainer from "~/components/AppContainer";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { buildEventDateParams, EventFilters } from "~/utils/eventFilters";

const AllEventsScreen = () => {
  const navigation: any = useNavigation();

  const [allEvents, setAllEvents] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<EventFilters>({
    eventDate: "upcoming",
    membersGroup: "",
    eventType: "",
  });
  const dateParams = buildEventDateParams(filters.eventDate);
  const {
    data: events,
    isLoading,
    isFetching,
  } = useGetAllEventsQuery(
    {
      page,
      limit: 10,
      searchBy: searchBy || undefined,
      eventType: filters.eventType || undefined,
      membersGroup: filters.membersGroup || undefined,
      ...dateParams,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (events) {
      if (page === 1) {
        setAllEvents(events.items);
      } else {
        setAllEvents((prevEvts: any[]) => {
          const combinedEvents = [...prevEvts, ...events.items];
          const uniqueEvents = Array.from(new Set(combinedEvents.map((evt) => evt._id))).map((_id) =>
            combinedEvents.find((evt) => evt._id === _id)
          );
          return uniqueEvents;
        });
      }
      setTotalPages(events.meta?.totalPages);
    }
  }, [events, page]);

  useEffect(() => {
    setPage(1);
    setAllEvents([]);
  }, [searchBy, filters]);

  const handleSearch = (text: string) => {
    setSearchBy(text);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <AppContainer gap={16} padding={0}>
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 12, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.greyLight }}>
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Search events..." onSearch={handleSearch} />
        </View>
        <TouchableOpacity
          style={{ backgroundColor: palette.greyLight, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" }}
          onPress={() => setShowCalendar(true)}
          accessibilityRole="button"
          accessibilityLabel="Open events calendar"
        >
          <FontAwesome6 name="calendar" size={16} color={palette.greyDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: palette.greyLight, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" }}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          accessibilityRole="button"
          accessibilityLabel={`Show events as ${viewMode === "list" ? "grid" : "list"}`}
        >
          <FontAwesome6 name={viewMode === "list" ? "grip" : "list"} size={16} color={palette.greyDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: palette.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" }}
          onPress={() => setShowFilter(true)}
          accessibilityRole="button"
          accessibilityLabel="Filter events"
        >
          <FontAwesome6 name="filter" size={16} color={palette.white} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 8, flex: 1 }}>
        {isLoading && page === 1 ? (
          <Loading marginVertical={32} />
        ) : allEvents?.length ? (
          <>
            <View style={viewMode === "grid" ? { flexDirection: "row", flexWrap: "wrap", gap: 8 } : { gap: 8 }}>
              {allEvents.map((evt: any) => (
                <TouchableOpacity
                  key={evt._id}
                  onPress={() => navigation.navigate("events-single", { slug: evt.slug })}
                  style={viewMode === "grid" ? { width: "48.5%" } : undefined}
                >
                  <EventCard
                    title={evt.name}
                    date={evt.eventDateTime}
                    image={evt.featuredImageUrl}
                    type={evt.eventType}
                    location={evt.linkOrLocation}
                    description={evt.description}
                    width={viewMode === "grid" ? "auto" : "auto"}
                    row={viewMode === "list"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Button
              disabled={page === totalPages}
              label={page === totalPages ? "The End" : "Load More"}
              loading={isFetching && page > 1}
              onPress={() => setPage((prev) => prev + 1)}
            />
          </>
        ) : (
          <EmptyData
            title="No Events Found"
            icon="calendar"
            subtitle={
              searchBy || Object.values(filters).some((f) => f)
                ? "No events match your search criteria. Try adjusting your filters."
                : "No upcoming events available."
            }
          />
        )}
      </View>

      <EventFilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <EventsCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        events={allEvents}
        onDateSelect={(date) => {
          setFilters({ ...filters, eventDate: date });
        }}
      />
    </AppContainer>
  );
};

export default AllEventsScreen;
