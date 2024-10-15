import { StyleSheet, Text, View } from "react-native";
import React from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { useGetSingleVolunteerJobQuery } from "~/store/api/volunteerApi";
import { formatDate } from "~/utils/dateFormatter";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const SingleVolunteersScreen = ({ route }: any) => {
  const { id } = route.params;
  const { data: volunteerJob, isLoading } = useGetSingleVolunteerJobQuery(id);

  return (
    <AppContainer>
      <View style={[styles.card, { gap: 8 }]}>
        <Text
          style={[
            styles.type,
            {
              backgroundColor: volunteerJob?.isActive ? palette.onSecondary : palette.error + "33",
              color: volunteerJob?.isActive ? palette.secondary : palette.error,
            },
          ]}
        >
          {volunteerJob?.isActive ? "Open" : "Closed"}
        </Text>

        <Text style={[typography.textXl, typography.fontBold]}>{volunteerJob?.title}</Text>

        <Text style={[typography.textBase, typography.fontMedium]}>{volunteerJob?.description}</Text>

        <View>
          <Text style={styles.label}>Responsibilities</Text>
          {volunteerJob?.responsibilities?.map((item: any) => (
            <Text key={item} style={styles.value}>
              {item}
            </Text>
          ))}
        </View>

        <View>
          <Text style={styles.label}>Requirements</Text>
          {volunteerJob?.requirements?.map((item: any) => (
            <Text key={item} style={styles.value}>
              {item}
            </Text>
          ))}
        </View>

        <View>
          <Text style={styles.label}>How to Apply</Text>
          <Text style={styles.value}>{volunteerJob?.applicationInstructions}</Text>
        </View>

        <View>
          <Text style={styles.label}>Closing Date</Text>
          <Text style={styles.value}>{formatDate(volunteerJob?.closingDate).date}</Text>
        </View>

        <View style={styles.companyInfo}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name="briefcase-medical" size={32} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.textBase, typography.fontSemiBold]}>{volunteerJob?.companyName}</Text>
            <Text style={[typography.textSm, typography.fontMedium]}>{volunteerJob?.companyLocation}</Text>
            <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>
              {volunteerJob?.contactEmail}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Posted on</Text>
          <Text style={styles.value}>
            {formatDate(volunteerJob?.createdAt).date + " || " + formatDate(volunteerJob?.createdAt).time}
          </Text>
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
  type: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...typography.textSm,
    ...typography.fontSemiBold,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  label: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.grey,
    textTransform: "uppercase",
  },
  value: { ...typography.textBase, ...typography.fontMedium, color: palette.black },
  companyInfo: { flexDirection: "row", gap: 8, marginVertical: 8 },
  iconContainer: {
    backgroundColor: palette.onPrimary,
    height: 56,
    width: 56,
    overflow: "hidden",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SingleVolunteersScreen;
