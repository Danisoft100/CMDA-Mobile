import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import { useGetEventAttendeesQuery } from "~/store/api/commentsReactionsApi";
import { palette, typography } from "~/theme";
import { backgroundColor, textColor } from "~/constants/roleColor";

const ROLE_COLORS: Record<string, string> = {
  Student: palette.primary,
  Doctor: palette.secondary,
  GlobalNetwork: palette.tertiary,
  Admin: palette.error,
};

const EventAttendeesScreen = ({ route }: any) => {
  const { eventId } = route.params;
  const [page, setPage] = useState(1);
  const [allAttendees, setAllAttendees] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useGetEventAttendeesQuery(
    { eventId, page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setAllAttendees(data.items);
      } else {
        setAllAttendees((prev) => {
          const combined = [...prev, ...data.items];
          const unique = Array.from(new Set(combined.map((a) => a._id))).map((_id) =>
            combined.find((a) => a._id === _id)
          );
          return unique;
        });
      }
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setAllAttendees([]);
  }, [eventId]);

  const totalPages = data?.meta?.totalPages || 1;

  return (
    <AppContainer gap={12}>
      <Text style={[typography.textXl, typography.fontBold]}>Attendees</Text>
      <Text style={[typography.textSm, { color: palette.grey }]}>
        {data?.meta?.total || 0} people attending
      </Text>

      {isLoading && page === 1 ? (
        <Loading marginVertical={32} />
      ) : allAttendees.length > 0 ? (
        <>
          {allAttendees.map((attendee: any) => {
            const role = attendee.role || attendee.membersGroup?.[0] || "Member";
            return (
              <View key={attendee._id} style={styles.attendeeRow}>
                <Image
                  source={{ uri: attendee.profilePictureUrl || attendee.avatar }}
                  style={styles.avatar}
                  defaultSource={require("~/assets/images/icon.png")}
                />
                <View style={styles.info}>
                  <Text style={[typography.textBase, typography.fontMedium]} numberOfLines={1}>
                    {attendee.firstName} {attendee.lastName}
                  </Text>
                  {attendee.chapter && (
                    <Text style={[typography.textXs, { color: palette.grey }]} numberOfLines={1}>
                      {attendee.chapter}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: backgroundColor[role] || palette.onPrimary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.textXs,
                      typography.fontSemiBold,
                      { color: textColor[role] || palette.primary },
                    ]}
                  >
                    {role}
                  </Text>
                </View>
              </View>
            );
          })}

          <Button
            disabled={page === totalPages}
            label={page === totalPages ? "The End" : "Load More"}
            loading={isFetching && page > 1}
            onPress={() => setPage((prev) => prev + 1)}
          />
        </>
      ) : (
        <EmptyData title="No Attendees" subtitle="No one has registered for this event yet." icon="account-group" />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.greyLight,
  },
  info: {
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
});

export default EventAttendeesScreen;
