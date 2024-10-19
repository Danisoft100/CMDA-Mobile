import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { useGetProfileQuery } from "~/store/api/profileApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatDate } from "~/utils/dateFormatter";
import { useGetAllTrainingsQuery } from "~/store/api/eventsApi";
import EmptyData from "~/components/EmptyData";
import { backgroundColor, textColor } from "~/constants/roleColor";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);
  const { data: profile } = useGetProfileQuery(null, { refetchOnMountOrArgChange: true });

  const INFO = useMemo(
    () => ({
      "Chapter/Region": profile?.region,
      Email: user?.email,
      Phone: profile?.phone,
    }),
    [profile, user]
  );

  const ABOUT = useMemo(
    () => ({
      "Date of Birth": formatDate(profile?.dateOfBirth).date,
      Gender: profile?.gender,
      ...(user?.role == "Student"
        ? { "Admission Year": profile?.admissionYear, "Year of Study": profile?.yearOfStudy }
        : { Specialty: profile?.specialty, "License Number": profile?.licenseNumber }),
      Bio: profile?.bio,
    }),
    [profile, user]
  );

  const { data: allTrainings, isLoading: isLoadingTrainings } = useGetAllTrainingsQuery(
    { membersGroup: user?.role },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <AppContainer gap={8}>
      <View style={[styles.card, { gap: 8 }]}>
        <View style={{ alignItems: "center" }}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile?.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: backgroundColor[user?.role] }]}>
              <MCIcon name="account" size={48} color={textColor[user?.role]} />
            </View>
          )}
        </View>

        <View>
          <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>{profile?.fullName}</Text>
          <Text style={[typography.textBase, { textAlign: "center" }]}>{user?.membershipId}</Text>
          <Text style={[styles.role, { backgroundColor: backgroundColor[user?.role], color: textColor[user?.role] }]}>
            {capitalizeWords(user?.role)}
          </Text>
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
        <Text style={[typography.textLg, typography.fontSemiBold]}>About Me</Text>
        <View style={{ gap: 4 }}>
          {Object.entries(ABOUT).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value || "N/A"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { gap: 8 }]}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>Training Records</Text>
        <View style={[styles.table, { maxHeight: 300 }]}>
          <View style={styles.tableHeader}>
            <View style={{ flex: 3 }}>
              <Text style={styles.tableHeaderText}>Training Name</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
            {allTrainings?.length ? (
              allTrainings?.map((item: any, n: number) => (
                <View
                  key={item._id}
                  style={[
                    styles.tableItem,
                    {
                      backgroundColor: (n + 1) % 2 ? palette.background : palette.onPrimary,
                      paddingVertical: (n + 1) % 2 ? 6 : 12,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tableItemText, { textTransform: "capitalize" }]}>{item.name}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={[
                        typography.textXs,
                        typography.fontSemiBold,
                        { color: item.completedUsers.includes(user._id) ? palette.success : palette.warning },
                      ]}
                    >
                      {item.completedUsers.includes(user._id) ? "COMPLETED" : "PENDING"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyData title="trainings" />
            )}
          </ScrollView>
        </View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: 8,
    textAlign: "center",
    ...typography.textSm,
    ...typography.fontSemiBold,
    alignSelf: "center",
  },
  profileRow: { flexDirection: "row", gap: 4 },
  profileLabel: { ...typography.textBase, color: palette.grey },
  profileValue: { ...typography.textBase, ...typography.fontMedium, color: palette.black },
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
});

export default ProfileScreen;
