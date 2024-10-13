import React, { useState } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useCreateFaithEntryMutation, useGetAllDevotionalsQuery } from "~/store/api/faithApi";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MemberCard from "~/components/member/MemberCard";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import { useGetAllEventsQuery } from "~/store/api/eventsApi";
import EventCard from "~/components/events/EventCard";
import { useGetAllResourcesQuery } from "~/store/api/resourcesApi";
import ResourceCard from "~/components/resources/ResourceCard";
import { useGetVolunteerJobsQuery } from "~/store/api/volunteerApi";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import TextField from "~/components/form/TextField";
import SelectField from "~/components/form/SelectField";
import Button from "~/components/form/Button";
import DevotionalModal from "~/components/home/DevotionalModal";

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

  const [createFaithEntry, { isLoading: isCreatingPrayer }] = useCreateFaithEntryMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: "all" });

  const handleCreatePrayer = (payload: any) => {
    createFaithEntry({ ...payload, isAnonymous: payload.isAnonymous || false })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: `Your ${payload.category} has been submitted successfully` });
        reset();
      });
  };

  const SectionHeader = ({ title, subtitle, actionText = "See all", action = () => {} }: any) => (
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

  return (
    <AppContainer stickyHeaderIndices={[0]}>
      <View style={{ backgroundColor: palette.background, paddingBottom: 8, marginTop: 24 }}>
        <View style={styles.header}>
          {user?.avatarUrl ? (
            <Image style={styles.avatar} source={{ uri: user?.avatarUrl }} />
          ) : (
            <View style={styles.avatar}>
              <MCIcon name="account" color={palette.primary} size={28} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: -8 }}>
            <Text style={[typography.textBase, typography.fontSemiBold]}>{user?.fullName || "User"} </Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {user?.role === "Student" ? (
                <FontAwesome6 name="user-graduate" size={18} color={palette.primary} />
              ) : user?.role === "Doctor" ? (
                <Fontisto name="doctor" size={18} color={palette.primary} />
              ) : (
                <MCIcon name="doctor" size={20} color={palette.primary} />
              )}
              <Text style={[typography.textSm, typography.fontMedium]}>{user?.role}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("home-messages")}>
            <MCIcon name="message-text" size={24} color={palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("home-notifications")}>
            <MCIcon name="bell" size={24} color={palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

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
          {/* <Text style={[typography.textLg, typography.fontSemiBold, { color: palette.white, marginBottom: 6 }]}>
            Daily Nugget
          </Text> */}
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
                onPress={() => navigation.navigate("tab", { screen: "events", params: { screen: "events-single" } })}
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
              <ResourceCard
                key={res._id}
                image={res?.featuredImage}
                title={res?.title}
                type={res.category}
                subtitle={res.description}
                style={{ marginRight: 8 }}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader title="Volunteer Opportunities" action={() => navigation.navigate("home-volunteer")} />
        {loadingJobs ? (
          <Text style={[typography.textBase, typography.fontMedium, { marginBottom: 6 }]}>Loading...</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {jobs?.items?.map((job: any) => (
              <TouchableOpacity key={job._id} style={styles.jobCard}>
                <FontAwesome6 name="briefcase-medical" size={36} color={palette.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[typography.textBase, typography.fontSemiBold]}>{job?.title}</Text>
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
        <View style={{ gap: 16 }}>
          <SelectField
            label="category"
            placeholder="Select Category"
            options={["Testimony", "Prayer Request", "Comment"]}
            control={control}
            errors={errors}
            required
          />
          <TextField
            label="content"
            placeholder={"Enter your testimonies, prayer requests or comments"}
            control={control}
            errors={errors}
            multiline={true}
            numberOfLines={4}
            minHeight={100}
          />
          <Button
            label={"Submit " + (watch("category") || "")}
            onPress={() => handleSubmit(handleCreatePrayer)}
            loading={isCreatingPrayer}
          />
        </View>
      </View>

      {/*  */}
      <DevotionalModal visible={openDevotional} onClose={() => setOpenDevotional(false)} devotional={devotional?.[0]} />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", gap: 16, alignItems: "center" },
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
});

export default HomeScreen;
