import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import capitalizeWords from "~/utils/capitalizeWords";

const ProfileScreen = () => {
  const [avatar, role] = ["", "Doctor"];

  const INFO = {
    "Chapter/Region": "University of Nigeria, Nsukka",
    Email: "somedude@mail.com",
    Phone: "08032616345",
  };

  const ABOUT = {
    "Date of Birth": new Date().toLocaleDateString(),
    Gender: "Male",
    Specialty: "Dentist",
    "License Number": "LTH1007",
    "Admission Year": "2020",
    "Year of Study": "4th Year",
  };

  const backgroundColor: any = {
    Student: palette.onPrimary,
    Doctor: palette.onSecondary,
    GlobalNetwork: palette.onTertiary,
  };

  const textColor: any = {
    Student: palette.primary,
    Doctor: palette.secondary,
    GlobalNetwork: palette.tertiary,
  };

  return (
    <AppContainer gap={8}>
      <View style={[styles.card, { gap: 8 }]}>
        <View style={{ alignItems: "center" }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: backgroundColor[role] }]}>
              <MCIcon name="account" size={48} color={textColor[role]} />
            </View>
          )}
        </View>

        <View>
          <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>
            Sunday Monday Tuesday
          </Text>
          <Text style={[typography.textBase, { textAlign: "center" }]}>CM10000218</Text>
          <Text style={[styles.role, { backgroundColor: backgroundColor[role], color: textColor[role] }]}>
            {capitalizeWords(role)}
          </Text>
        </View>

        <View style={{ gap: 4, marginTop: 8 }}>
          {Object.entries(INFO).map(([key, value]: any) => (
            <View key={key} style={styles.profileRow}>
              <Text style={styles.profileLabel}>{key}:</Text>
              <Text style={styles.profileValue}>{value}</Text>
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
              <Text style={styles.profileValue}>{value}</Text>
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
    borderRadius: 32,
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
});

export default ProfileScreen;
