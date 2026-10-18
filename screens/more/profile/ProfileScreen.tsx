import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import capitalizeWords from "~/utils/capitalizeWords";
import { useGetProfileQuery } from "~/store/api/profileApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatDate } from "~/utils/dateFormatter";
import { formatCurrency } from "~/utils/currencyFormatter";
import { useGetAllTrainingsQuery } from "~/store/api/eventsApi";
import EmptyData from "~/components/EmptyData";
import { backgroundColor, textColor } from "~/constants/roleColor";
import Button from "~/components/form/Button";
import { useGetSubscriptionStatusQuery } from "~/store/api/paymentsApi";
import { useGetRegisteredEventsQuery } from "~/store/api/eventsApi";
import { useTutorial } from "~/contexts/TutorialContext";
import LifetimeMemberStatus from "~/components/member/LifetimeMemberStatus";

const ProfileScreen = ({ navigation, route }: any) => {
  const fromHome = route.params?.fromHome;
  const { reset: resetTutorial, start: startTutorial } = useTutorial();

  const { user } = useSelector(selectAuth);
  const { data: profile } = useGetProfileQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const { data: subscriptionStatus } = useGetSubscriptionStatusQuery(
    undefined,
    { skip: user?.role !== "GlobalNetwork" },
  );

  const { data: events } = useGetRegisteredEventsQuery({ page: 1, limit: 100 });
  const registeredEvents = events?.events || events?.items || [];
  const socialLinks = useMemo(() => {
    if (Array.isArray(profile?.socials)) return profile.socials;
    if (profile?.socials && typeof profile.socials === "object") {
      return Object.entries(profile.socials).map(([name, link]) => ({
        name,
        link,
      }));
    }
    return [];
  }, [profile?.socials]);
  const isTrainingCompleted = (training: any) =>
    training?.completedUsers?.some(
      (completedUser: any) =>
        String(completedUser?._id || completedUser) === String(user?._id),
    );
  const INFO = useMemo(
    () => ({
      "Chapter/Region": profile?.region,
      Email: user?.email,
      Phone: profile?.phone,
      "Leadership Position": profile?.leadershipPosition,
    }),
    [profile, user],
  );

  const ABOUT = useMemo(
    () => ({
      "Date of Birth": formatDate(profile?.dateOfBirth).date,
      Gender: profile?.gender,
      ...(user?.role == "Student"
        ? {
            "Admission Year": profile?.admissionYear,
            "Year of Study": profile?.yearOfStudy,
          }
        : {
            Specialty: profile?.specialty,
            "License Number": profile?.licenseNumber,
            "Years of Experience": profile?.yearsOfExperience,
          }),
      Bio: profile?.bio,
    }),
    [profile, user],
  );

  const { data: allTrainings, isLoading: isLoadingTrainings } =
    useGetAllTrainingsQuery(
      { membersGroup: user?.role },
      { refetchOnMountOrArgChange: true },
    );

  return (
    <AppContainer gap={12}>
      <Text style={[typography.textXl, typography.fontBold]}>My Profile</Text>
      {["Student", "Doctor"].includes(user?.role) ? (
        <Button
          label={`Transition to ${user?.role === "Student" ? "Doctor" : "Global Network"}`}
          variant="outlined"
          onPress={() =>
            navigation.navigate(
              fromHome ? "home-profile-transition" : "more-profile-transition",
            )
          }
        />
      ) : null}
      {!user?.hasLifetimeMembership ? (
        subscriptionStatus?.annualTarget ? (
          <View
            style={[
              {
                backgroundColor: subscriptionStatus.isFullyPaid
                  ? palette.onSecondary
                  : palette.onPrimary,
                borderWidth: 1,
                borderColor: subscriptionStatus.isFullyPaid
                  ? palette.secondary
                  : palette.primary,
              },
              {
                paddingHorizontal: 12,
                paddingVertical: 10,
                gap: 6,
                borderRadius: 8,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MCIcon
                name={
                  subscriptionStatus.isFullyPaid
                    ? "check-decagram"
                    : "clock-outline"
                }
                size={20}
                color={
                  subscriptionStatus.isFullyPaid
                    ? palette.secondary
                    : palette.primary
                }
              />
              <Text
                style={[
                  typography.textBase,
                  typography.fontSemiBold,
                  {
                    color: subscriptionStatus.isFullyPaid
                      ? palette.secondary
                      : palette.primary,
                  },
                ]}
              >
                {subscriptionStatus.isFullyPaid
                  ? "Year Fully Paid"
                  : "Subscription In Progress"}
              </Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <Text style={[typography.textSm, { color: palette.greyDark }]}>
                {formatCurrency(
                  subscriptionStatus.paidAmount,
                  subscriptionStatus.currency,
                )}{" "}
                paid ·{" "}
                {formatCurrency(
                  subscriptionStatus.remainingAmount,
                  subscriptionStatus.currency,
                )}{" "}
                remaining
              </Text>
              <Text
                style={[
                  typography.textXs,
                  { color: palette.grey, marginTop: 2 },
                ]}
              >
                {subscriptionStatus.subscriptionYear} target ·{" "}
                {subscriptionStatus.currency} {subscriptionStatus.annualTarget}
                /year
              </Text>
            </View>
          </View>
        ) : user?.subscribed ? (
          <View
            style={[
              {
                backgroundColor: palette.onSecondary,
                flexDirection: "row",
                alignItems: "center",
              },
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
                borderRadius: 8,
              },
            ]}
          >
            <Text
              style={[
                typography.textBase,
                typography.fontSemiBold,
                { color: palette.secondary },
              ]}
            >
              Subscribed
            </Text>
            <MCIcon name="check-decagram" size={20} color={palette.secondary} />
          </View>
        ) : (
          <View
            style={[
              {
                backgroundColor: palette.error + "33",
                flexDirection: "row",
                alignItems: "center",
              },
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 6,
                borderRadius: 8,
              },
            ]}
          >
            <Ionicons name="warning" size={24} color={palette.error} />
            <Text
              style={[
                typography.textBase,
                typography.fontSemiBold,
                { color: palette.error },
              ]}
            >
              Not Subscribed
            </Text>
          </View>
        )
      ) : null}

      <View style={[styles.card, { gap: 8 }]}>
        <Button
          dense
          icon="pencil"
          onPress={() =>
            navigation.navigate(
              fromHome ? "home-profile-edit" : "more-profile-edit",
            )
          }
          style={styles.profileEditButton}
        />
        <View style={{ alignItems: "center" }}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile?.avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarIcon,
                { backgroundColor: backgroundColor[user?.role] },
              ]}
            >
              <MCIcon name="account" size={48} color={textColor[user?.role]} />
            </View>
          )}
        </View>

        <View>
          <Text
            style={[
              typography.textLg,
              typography.fontSemiBold,
              { textAlign: "center" },
            ]}
          >
            {profile?.fullName}
          </Text>
          <Text style={[typography.textBase, { textAlign: "center" }]}>
            {user?.membershipId}
          </Text>
          <View style={styles.memberBadges}>
            <Text
              style={[
                styles.role,
                {
                  backgroundColor: backgroundColor[user?.role],
                  color: textColor[user?.role],
                },
              ]}
            >
              {capitalizeWords(user?.role)}
            </Text>
            {user?.hasLifetimeMembership ? (
              <LifetimeMemberStatus
                membershipType={user?.lifetimeMembershipType}
                compact
                style={styles.profileLifetimeBadge}
              />
            ) : null}
          </View>
        </View>

        <View style={{ gap: 4, marginTop: 8 }}>
          {Object.entries(INFO).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value || "N/A"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>
          About Me
        </Text>
        <View style={{ gap: 4 }}>
          {Object.entries(ABOUT).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value || "N/A"}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <View style={[styles.card, { gap: 12 }]}>
          <Text style={[typography.textLg, typography.fontSemiBold]}>
            Socials
          </Text>
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {socialLinks.map((social: any, index: number) => {
              const iconMap: Record<string, string> = {
                facebook: "facebook",
                twitter: "x-twitter",
                instagram: "instagram",
                linkedin: "linkedin",
              };
              const iconName = iconMap[social.name?.toLowerCase()] || "link";
              const url = social.link?.startsWith("http")
                ? social.link
                : `https://${social.link}`;
              return (
                <TouchableOpacity
                  key={`${social.name}-${index}`}
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL(url)}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${social.name} profile`}
                >
                  <FontAwesome6
                    name={iconName as any}
                    size={20}
                    color={palette.greyDark}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>
          Training Records
        </Text>
        <View style={[styles.table, { maxHeight: 300 }]}>
          <View style={styles.tableHeader}>
            <View style={{ flex: 3 }}>
              <Text style={styles.tableHeaderText}>Training Name</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
          </View>

          <View style={{ paddingVertical: 4, gap: 12 }}>
            {allTrainings?.length ? (
              allTrainings?.map((item: any, n: number) => (
                <View
                  key={item._id}
                  style={[
                    styles.tableItem,
                    {
                      backgroundColor:
                        (n + 1) % 2 ? palette.background : palette.onPrimary,
                      paddingVertical: (n + 1) % 2 ? 6 : 12,
                    },
                  ]}
                >
                  <View style={{ flex: 3 }}>
                    <Text
                      style={[
                        styles.tableItemText,
                        { textTransform: "capitalize" },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={[
                        typography.textXs,
                        typography.fontSemiBold,
                        styles.trainingStatus,
                        isTrainingCompleted(item)
                          ? styles.trainingComplete
                          : styles.trainingPending,
                      ]}
                    >
                      {isTrainingCompleted(item) ? "COMPLETED" : "PENDING"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyData title="trainings" />
            )}{" "}
          </View>
        </View>
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>
          Event Activity
        </Text>
        {registeredEvents.length ? (
          registeredEvents.map((event: any, index: number) => {
            const isPast =
              event?.eventDateTime &&
              new Date(event.eventDateTime).getTime() < Date.now();
            return (
              <View
                key={event._id}
                style={[
                  styles.tableItem,
                  {
                    paddingVertical: 10,
                    backgroundColor:
                      index % 2 ? palette.background : palette.onPrimary,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tableItemText, typography.fontSemiBold]}>
                    {event.name}
                  </Text>
                  <Text style={styles.tableItemText}>
                    {formatDate(event.eventDateTime).date}
                  </Text>
                </View>
                <Text
                  style={[
                    typography.textXs,
                    typography.fontSemiBold,
                    { color: isPast ? palette.greyDark : palette.secondary },
                  ]}
                >
                  {isPast ? "ATTENDED/PAST" : "REGISTERED"}
                </Text>
              </View>
            );
          })
        ) : (
          <EmptyData
            title="Event Activity"
            subtitle="Registered events will appear here."
          />
        )}
      </View>

      {/* Restart Tutorial */}
      <TouchableOpacity
        style={[
          styles.card,
          { flexDirection: "row", alignItems: "center", gap: 12 },
        ]}
        onPress={async () => {
          await resetTutorial();
          navigation.navigate("home", { screen: "home-index" });
          setTimeout(() => startTutorial(), 300);
        }}
        accessibilityRole="button"
        accessibilityLabel="Restart app tutorial"
      >
        <MCIcon name="school" size={24} color={palette.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.textBase, typography.fontMedium]}>
            Restart App Tutorial
          </Text>
          <Text style={[typography.textSm, { color: palette.grey }]}>
            Take a guided tour of the app features
          </Text>
        </View>
        <MCIcon name="chevron-right" size={24} color={palette.grey} />
      </TouchableOpacity>
      <View style={styles.bottomSpacer} />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 0,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileEditButton: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  avatarIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  role: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: "hidden",
    textAlign: "center",
    ...typography.textSm,
    ...typography.fontSemiBold,
    alignSelf: "center",
  },
  memberBadges: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 8,
  },
  profileLifetimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  profileRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  profileLabel: {
    ...typography.textBase,
    color: palette.greyDark,
    flexBasis: "42%",
  },
  profileValue: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.black,
    flex: 1,
    textAlign: "right",
  },
  table: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
    backgroundColor: palette.greyLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  tableHeaderText: {
    ...typography.textSm,
    ...typography.fontBold,
    color: palette.black,
  },
  tableItem: { flexDirection: "row", gap: 12, paddingHorizontal: 8 },
  tableItemText: { color: palette.greyDark, ...typography.textSm },
  trainingStatus: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trainingComplete: {
    color: palette.success,
    backgroundColor: palette.onSecondary,
  },
  trainingPending: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
  },
  transactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  socialIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.greyLight,
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default ProfileScreen;
