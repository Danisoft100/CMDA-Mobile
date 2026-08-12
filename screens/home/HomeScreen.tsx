import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useGetAllDevotionalsQuery, useGetAllFaithEntriesQuery, useCreateFaithEntryMutation } from "~/store/api/faithApi";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MemberCard from "~/components/member/MemberCard";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import { useGetAllEventsQuery } from "~/store/api/eventsApi";
import EventCard from "~/components/events/EventCard";
import { useGetAllResourcesQuery } from "~/store/api/resourcesApi";
import ResourceCard from "~/components/resources/ResourceCard";
import { useGetVolunteerJobsQuery } from "~/store/api/volunteerApi";
import DevotionalModal from "~/components/home/DevotionalModal";
import NewFaithEntryModal from "~/components/home/NewFaithEntryModal";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import { useGetNotificationStatsQuery } from "~/store/api/notificationsApi";
import Loading from "~/components/Loading";
import Button from "~/components/form/Button";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import LifetimeMemberStatus from "~/components/member/LifetimeMemberStatus";

const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);
  const [openDevotional, setOpenDevotional] = useState(false);
  const [openFaithModal, setOpenFaithModal] = useState(false);
  const [createFaithEntry, { isLoading: isCreatingFaith }] = useCreateFaithEntryMutation();
  const headerNavigation = useNavigation<any>();

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

  const { data: { unreadMessagesCount, unreadNotificationCount } = {} } = useGetNotificationStatsQuery(
    undefined,
    { refetchOnMountOrArgChange: true, pollingInterval: 300000 }
  );

  const handleCreateFaithEntry = (payload: any) => {
    createFaithEntry({ ...payload, isAnonymous: payload.isAnonymous || false })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: `Your ${payload.category} has been submitted successfully` });
        setOpenFaithModal(false);
      });
  };

  const SectionHeader = ({ title, subtitle, action = () => { } }: any) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8, marginBottom: 2 }}>
      <View>
        <Text style={[typography.textLg, typography.fontSemiBold]}>{title}</Text>
        {subtitle && <Text style={[typography.textSm, { color: palette.greyDark }]}>{subtitle}</Text>}
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={action}
        accessibilityRole="button"
        accessibilityLabel={`View all ${title}`}
        hitSlop={8}
      >
        <MCIcon name="arrow-right-thin" size={32} color={palette.primary} />
      </TouchableOpacity>
    </View>
  );

  const AppHeader = () => (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
          onPress={() => headerNavigation.navigate("home-profile", { fromHome: true })}
          accessibilityRole="button"
          accessibilityLabel={`Open profile for ${user?.fullName || "member"}`}
        >
          {user?.avatarUrl ? (
            <Image style={styles.avatar} source={{ uri: user?.avatarUrl }} />
          ) : (
            <View style={styles.avatar}>
              <MCIcon name="account" color={palette.primary} size={28} />
            </View>
          )}
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[typography.textBase, typography.fontSemiBold, { textTransform: "capitalize" }]}>
                {user?.fullName || "User"}{" "}
              </Text>
              {user?.hasLifetimeMembership && (
                <LifetimeMemberStatus membershipType={user?.lifetimeMembershipType} compact />
              )}
            </View>
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
        <TouchableOpacity
          style={{ position: "relative", width: 32, height: 32 }}
          onPress={() => headerNavigation.navigate("home-messages")}
          accessibilityRole="button"
          accessibilityLabel={unreadMessagesCount > 0 ? `Messages, ${unreadMessagesCount} unread` : "Messages"}
        >
          <MCIcon name="message-text" size={28} color={palette.primary} />
          {unreadMessagesCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={[{ fontSize: 10, lineHeight: 10 }, typography.fontMedium, { color: palette.white }]}>
                {unreadMessagesCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "relative", width: 32, height: 32 }}
          onPress={() => headerNavigation.navigate("home-notifications")}
          accessibilityRole="button"
          accessibilityLabel={unreadNotificationCount > 0 ? `Notifications, ${unreadNotificationCount} unread` : "Notifications"}
        >
          <MCIcon name="bell" size={28} color={palette.primary} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={[{ fontSize: 10, lineHeight: 10 }, typography.fontMedium, { color: palette.white }]}>
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
      {!user?.subscribed && (
        <View style={styles.subscribeInfo}>
          <Text style={[typography.textSm, typography.fontMedium, { color: palette.error }]}>
            You do not have any active subscription. Subscribe to unlock all our premium features!
          </Text>
          <Button label="Subscribe Now" dense onPress={() => navigation.navigate("tab", { screen: "payment" })} />
        </View>
      )}

      <ImageBackground source={require("~/assets/images/cheerful-doctor.png")} style={styles.nuggetBg}>
        <View style={styles.nuggetContent}>
          {loadingVerse ? (
            <Loading color={palette.white} />
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
                <TouchableOpacity
                  onPress={() => setOpenDevotional(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open today's devotional"
                >
                  <FontAwesome5 name="praying-hands" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ImageBackground>

      {/* Impact Fund Banner */}
      <View style={styles.impactFundBanner}>
        <View style={styles.impactFundBadge}>
          <Text style={styles.impactFundBadgeText}>FEATURED</Text>
        </View>
        <View style={styles.impactFundLogoContainer}>
          <MCIcon name="charity" size={40} color={palette.primary} />
        </View>
        <Text style={styles.impactFundTitle}>Join us in Sustaining the vision of caring for the whole Man</Text>
        <TouchableOpacity
          style={styles.impactFundButton}
          onPress={() => Linking.openURL("https://impact.cmdanigeria.org")}
          activeOpacity={0.8}
          accessibilityRole="link"
        >
          <Text style={styles.impactFundButtonText}>Learn More & Contribute</Text>
        </TouchableOpacity>
      </View>

      <View>
        <SectionHeader title="Connect with Members" action={() => navigation.navigate("home-members")} />
        {loadingUsers ? (
          <Loading />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allUsers?.items
              ?.filter((x: any) => x._id !== user?._id)
              .map((mem: any, index: number) => (
                <MemberCard
                  key={`${mem._id}-${index}`}
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
          <Loading />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allEvents?.items?.map((evt: any) => (
              <TouchableOpacity
                key={evt._id}
                onPress={() => navigation.navigate("home-events-single", { slug: evt.slug })}
                accessibilityRole="button"
                accessibilityLabel={`Open event ${evt.name}`}
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
          <Loading />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allResources?.items?.map((res: any) => (
              <TouchableOpacity
                key={res._id}
                onPress={() => navigation.navigate("home-resources-single", { slug: res.slug })}
                accessibilityRole="button"
                accessibilityLabel={`Open resource ${res.title}`}
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
          <Loading />
        ) : (
          <View style={{ gap: 12 }}>
            {jobs?.items?.map((job: any) => (
              <TouchableOpacity
                key={job._id}
                style={styles.jobCard}
                onPress={() => navigation.navigate("home-volunteers-single", { id: job._id })}
                accessibilityRole="button"
                accessibilityLabel={`Open volunteer opportunity ${job.title}`}
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <SectionHeader
            title="Faith Entry"
            subtitle="Testimonies, Prayer Requests & Comments"
            action={() => navigation.navigate("home-faith")}
          />
          <TouchableOpacity
            style={styles.faithNewButton}
            onPress={() => setOpenFaithModal(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create a new faith entry"
          >
            <MCIcon name="plus" size={20} color={palette.white} />
          </TouchableOpacity>
        </View>
        {isLoadingFaith ? (
          <Loading />
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
      <NewFaithEntryModal
        visible={openFaithModal}
        onClose={() => setOpenFaithModal(false)}
        onSubmit={handleCreateFaithEntry}
        isLoading={isCreatingFaith}
      />
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
    height: 200,
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
    right: 3,
    top: 0,
    backgroundColor: palette.secondary,
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  impactFundBanner: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  impactFundBadge: {
    position: "absolute",
    top: 10,
    right: 16,
    backgroundColor: palette.error,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  impactFundBadgeText: {
    ...typography.textXs,
    ...typography.fontBold,
    color: palette.white,
    letterSpacing: 1,
  },
  impactFundLogoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  impactFundTitle: {
    ...typography.textBase,
    ...typography.fontBold,
    color: palette.white,
    textAlign: "center",
    marginBottom: 16,
  },
  impactFundButton: {
    backgroundColor: palette.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  impactFundButtonText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
  faithNewButton: {
    backgroundColor: palette.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginTop: 8,
  },
});

export default HomeScreen;
