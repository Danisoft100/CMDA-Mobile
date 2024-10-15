import { Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { useGetSingleUserQuery } from "~/store/api/membersApi";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";
import { backgroundColor, textColor } from "~/constants/roleColor";

const SingleMembersScreen = ({ navigation, route }: any) => {
  const { id } = route.params;

  const { data: member, isLoading } = useGetSingleUserQuery(id);

  useEffect(() => {
    navigation.setOptions({ headerTitle: member?.fullName || "Member's Profile" });
  }, [navigation, member]);

  const memberInfo = useMemo(() => {
    return {
      "First Name": member?.firstName,
      "Middle Name": member?.middleName,
      "Last Name": member?.lastName,
      Gender: member?.gender,
      Membership: member?.role,
      Region: member?.region,
      "Email Address": member?.email,
      Birthday: new Date(member?.dateOfBirth).toLocaleString("en-US", { month: "long", day: "numeric" }),
      ...(member?.role == "Student"
        ? { "Admission Year": member?.admissionYear, "Year of Study": member?.yearOfStudy }
        : { Specialty: member?.specialty, "License Number": member?.licenseNumber }),
      About: member?.bio,
    };
  }, [member]);

  return (
    <AppContainer>
      <View style={[styles.card, { gap: 8 }]}>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("home-messages-single", { id, fullName: member?.fullName })}
          >
            <MCIcon name="message-text-outline" color={palette.primary} size={28} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center" }}>
          {member?.avatarUrl ? (
            <Image source={{ uri: member?.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: backgroundColor[member?.role] }]}>
              <MCIcon name="account" size={48} color={textColor[member?.role]} />
            </View>
          )}
        </View>

        <View>
          <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>{member?.fullName}</Text>
          <Text style={[typography.textBase, { textAlign: "center" }]}>{member?.membershipId}</Text>
          <Text
            style={[styles.role, { backgroundColor: backgroundColor[member?.role], color: textColor[member?.role] }]}
          >
            {capitalizeWords(member?.role)}
          </Text>
        </View>

        <View style={{ gap: 4, marginTop: 8 }}>
          {Object.entries(memberInfo).map(([key, value]: any) => (
            <View key={key} style={styles.memberRow}>
              <Text style={styles.memberLabel}>{key}:</Text>
              <Text style={styles.memberValue}>{value || "N/A"}</Text>
            </View>
          ))}
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
  memberRow: { flexDirection: "row", gap: 4 },
  memberLabel: { ...typography.textBase, color: palette.grey },
  memberValue: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.black,
    flexWrap: "wrap",
    flexShrink: 1,
  },
});

export default SingleMembersScreen;
