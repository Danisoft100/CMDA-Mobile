import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import {
  useCreateFaithEntryMutation,
  useGetAllDevotionalsQuery,
  useGetAllFaithEntriesQuery,
} from "~/store/api/faithApi";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MemberCard from "~/components/member/MemberCard";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import { useGetAllEventsQuery } from "~/store/api/eventsApi";
import EventCard from "~/components/events/EventCard";
import { useGetAllResourcesQuery } from "~/store/api/resourcesApi";
import ResourceCard from "~/components/resources/ResourceCard";
import { useGetVolunteerJobsQuery } from "~/store/api/volunteerApi";
import DevotionalModal from "~/components/home/DevotionalModal";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import { useGetNotificationStatsQuery } from "~/store/api/notificationsApi";

const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);
  const [openDevotional, setOpenDevotional] = useState(false);

  const { data: devotional, isLoading: loadingVerse } = useGetAllDevotionalsQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const { data: allResources, isLoading: loadingRes } = useGetAllResourcesQuery({ page: 1, limit: 10 });
  const { data: allEvents, isLoading: loadingEvents } = useGetAllEventsQuery(
    { page: 1, limit: 10, membersGroup: user?.role },
    { refetchOnMountOrArgChange: true }
  );
  const { data: jobs, isLoading: loadingJobs } = useGetVolunteerJobsQuery(
    { page: 1, limit: 3 },
    { refetchOnMountOrArgChange: true }
  );
  const { data: allUsers, isLoading: loadingUsers } = useGetAllUsersQuery(
    { page: 1, limit: 10 },
    { refetchOnMountOrArgChange: true }
  );
  const { data: faithEntries, isLoading: isLoadingFaith } = useGetAllFaithEntriesQuery(
    { page: 1, limit: 10 },
    { refetchOnMountOrArgChange: true }
  );

  const { data: { unreadMessagesCount, unreadNotificationCount } = {} } = useGetNotificationStatsQuery(null, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 300000,
  });

  const SectionHeader = ({ title, subtitle, action = () => {} }: any) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8, marginBottom: 2 }}>
      <View>
        <Text style={[typography.textLg, typography.fontSemiBold]}>{title}</Text>
        {subtitle && <Text style={[typography.textSm, { color: palette.greyDark }]}>{subtitle}</Text>}
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={action}>
        <MCIcon name="arrow-right-thin" size={32} color={palette.primary} />
      </TouchableOpacity>
    </View>
  );

  const AppHeader = () => (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
          onPress={() => navigation.navigate("home-profile", { fromHome: true })}
        >
          {user?.avatarUrl ? (
            <Image style={styles.avatar} source={{ uri: user?.avatarUrl }} />
          ) : (
            <View style={styles.avatar}>
              <MCIcon name="account" color={palette.primary} size={28} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[typography.textBase, typography.fontSemiBold]}>{user?.fullName || "User"} </Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {user?.role === "Student" ? (
                <FontAwesome6 name="user-graduate" size={16} color={palette.primary} />
              ) : user?.role === "Doctor" ? (
                <Fontisto name="doctor" size={16} color={palette.primary} />
              ) : (
                <MCIcon name="doctor" size={18} color={palette.primary} />
              )}
              <Text style={[typography.textSm, typography.fontMedium]}>{user?.role}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("home-messages")}>
          <MCIcon name="message-text" size={24} color={palette.primary} />
          {unreadMessagesCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={[typography.textXs, typography.fontSemiBold, { color: palette.white }]}>
                {unreadMessagesCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("home-notifications")}>
          <MCIcon name="bell" size={24} color={palette.primary} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={[typography.textXs, typography.fontSemiBold, { color: palette.white }]}>
                {unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  useEffect(() => {
    navigation.setOptions({ header: AppHeader, headerShown: true, gestureEnabled: false });
  }, [navigation, unreadMessagesCount, unreadNotificationCount]);

  return (
    <AppContainer>
      {!user.subscribed && (
        <View style={styles.subscribeInfo}>
          <Text style={[typography.textSm, typography.fontMedium, { color: palette.error }]}>
            You currently do not have an active subscription. Without a subscription, you won&apos;t have access to our
            premium features.
          </Text>
          <TouchableOpacity>
            <Text
              style={[
                typography.textSm,
                typography.fontSemiBold,
                { textDecorationLine: "underline", color: palette.primary },
              ]}
            >
              Click here to subscribe now.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ImageBackground source={require("~/assets/images/cheerful-doctor.png")} style={styles.nuggetBg}>
        <View style={styles.nuggetContent}>
          {loadingVerse ? (
            <Text style={[typography.textBase, typography.fontMedium, { color: palette.white, marginBottom: 6 }]}>
              Loading...
            </Text>
          ) : (
            <>
              <Text
                style={[typography.textSm, typography.fontMedium, { color: palette.white, marginBottom: 6 }]}
                numberOfLines={4}
              >
                {devotional?.[0]?.keyVerseContent}
              </Text>
              <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.white, marginBottom: 6 }]}>
                - {devotional?.[0]?.keyVerse}
              </Text>
              <View style={{ alignItems: "flex-end", padding: 12 }}>
                <TouchableOpacity onPress={() => setOpenDevotional(true)}>
                  <FontAwesome5 name="praying-hands" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ImageBackground>

      <View>
        <SectionHeader title="Connect with Members" action={() => navigation.navigate("home-members")} />
        {loadingUsers ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allUsers?.items
              ?.filter((x: any) => x._id !== user?._id)
              .map((mem: any) => (
                <MemberCard
                  key={mem.membershipId}
                  memId={mem.membershipId}
                  id={mem._id}
                  fullName={mem.fullName}
                  avatar={mem.avatarUrl}
                  role={mem.role}
                  region={mem.region}
                  style={{ marginRight: 8 }}
                  navigation={navigation}
                />
              ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader title="Events and Trainings" action={() => navigation.navigate("tab", { screen: "events" })} />
        {loadingEvents ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allEvents?.items?.map((evt: any) => (
              <TouchableOpacity
                key={evt._id}
                onPress={() => navigation.navigate("home-events-single", { slug: evt.slug })}
              >
                <EventCard
                  title={evt.name}
                  date={evt.eventDateTime}
                  image={evt.featuredImageUrl}
                  type={evt.eventType}
                  location={evt.linkOrLocation}
                  description={evt.description}
                  style={{ marginRight: 6 }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader title="Resource Library" action={() => navigation.navigate("tab", { screen: "resources" })} />
        {loadingRes ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allResources?.items?.map((res: any) => (
              <TouchableOpacity
                key={res._id}
                onPress={() => navigation.navigate("home-resources-single", { slug: res.slug })}
              >
                <ResourceCard
                  image={res?.featuredImage}
                  title={res?.title}
                  type={res.category}
                  subtitle={res.description}
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader title="Volunteer Opportunities" action={() => navigation.navigate("home-volunteers")} />
        {loadingJobs ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {jobs?.items?.map((job: any) => (
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
        )}
      </View>

      <View>
        <SectionHeader
          title="Faith Entry"
          subtitle="Testimonies, Prayer Requests & Comments"
          action={() => navigation.navigate("home-faith")}
        />
        {isLoadingFaith ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
            {faithEntries?.items?.map((faith: any) => (
              <FaithEntryCard
                key={faith._id}
                category={faith.category}
                user={faith.user}
                isAnonymous={faith.isAnonymous}
                content={faith.content}
                createdAt={faith.createdAt}
                style={{ width: 260, marginRight: 8 }}
                truncate
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/*  */}
      <DevotionalModal visible={openDevotional} onClose={() => setOpenDevotional(false)} devotional={devotional?.[0]} />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: palette.background,
  },
  avatar: {
    height: 48,
    width: 48,
    backgroundColor: palette.onPrimaryContainer,
    borderRadius: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribeInfo: {
    backgroundColor: palette.error + "22",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  nuggetBg: {
    height: 180,
    backgroundColor: palette.black + "88",
    overflow: "hidden",
    borderRadius: 24,
  },
  nuggetContent: {
    flex: 1,
    padding: 12,
    justifyContent: "flex-end",
    borderRadius: 24,
    backgroundColor: palette.black + "88",
  },
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
  badgeContainer: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: palette.secondary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
