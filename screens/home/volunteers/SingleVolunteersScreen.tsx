import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import {
  useGetSingleVolunteerJobQuery,
  useVolunteerForJobMutation,
  useGetShiftsForJobQuery,
  useSignUpForShiftMutation,
  useWithdrawFromShiftMutation,
} from "~/store/api/volunteerApi";
import { formatDate } from "~/utils/dateFormatter";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import Button from "~/components/form/Button";
import EmptyData from "~/components/EmptyData";
import Loading from "~/components/Loading";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import Toast from "react-native-toast-message";

const SingleVolunteersScreen = ({ route }: any) => {
  const { id } = route.params;
  const { data: volunteerJob, isLoading } = useGetSingleVolunteerJobQuery(id);
  const [volunteerForJob, { isLoading: isRegistering }] = useVolunteerForJobMutation();
  const { data: shiftsData, isLoading: isLoadingShifts } = useGetShiftsForJobQuery({ jobId: id });
  const [signUpForShift, { isLoading: isSigningUp }] = useSignUpForShiftMutation();
  const [withdrawFromShift, { isLoading: isWithdrawing }] = useWithdrawFromShiftMutation();
  const { user } = useSelector(selectAuth);

  const [activeTab, setActiveTab] = useState<"details" | "shifts">("details");

  const alreadyVolunteered = volunteerJob?.applicants?.some((applicant: any) =>
    String(applicant?._id || applicant) === String(user?._id)
  );
  const isClosed = !volunteerJob?.isActive || new Date(volunteerJob?.closingDate).getTime() <= Date.now();

  const shifts = shiftsData?.items || shiftsData || [];

  const confirmVolunteer = () => {
    Alert.alert("Volunteer for this position", volunteerJob?.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await volunteerForJob({ id }).unwrap();
            Toast.show({ type: "success", text1: "You have volunteered successfully" });
          } catch (error: any) {
            Toast.show({ type: "error", text1: error?.data?.message || "Unable to volunteer for this position" });
          }
        },
      },
    ]);
  };

  const handleSignUpForShift = (shiftId: string, shiftTitle: string) => {
    Alert.alert("Sign Up for Shift", shiftTitle, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Up",
        onPress: async () => {
          try {
            await signUpForShift({ shiftId }).unwrap();
            Toast.show({ type: "success", text1: "You have signed up for this shift" });
          } catch (error: any) {
            Toast.show({ type: "error", text1: error?.data?.message || "Unable to sign up for this shift" });
          }
        },
      },
    ]);
  };

  const handleWithdrawFromShift = (shiftId: string) => {
    Alert.alert("Withdraw from Shift", "Are you sure you want to withdraw from this shift?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: async () => {
          try {
            await withdrawFromShift({ shiftId }).unwrap();
            Toast.show({ type: "success", text1: "You have withdrawn from this shift" });
          } catch (error: any) {
            Toast.show({ type: "error", text1: error?.data?.message || "Unable to withdraw from this shift" });
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <AppContainer><ActivityIndicator size="large" color={palette.primary} /></AppContainer>;
  }

  const renderShiftCard = (shift: any) => {
    const spotsAvailable = (shift.maxVolunteers || 0) - (shift.currentVolunteers || 0);
    const isSignedUp = shift.volunteers?.some((v: any) => String(v?._id || v) === String(user?._id));
    const isFull = spotsAvailable <= 0;

    return (
      <View key={shift._id} style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <Text style={[typography.textBase, typography.fontSemiBold, { flex: 1 }]}>{shift.title}</Text>
          {isSignedUp && (
            <View style={styles.signedUpBadge}>
              <Text style={styles.signedUpText}>Signed Up</Text>
            </View>
          )}
        </View>

        <View style={styles.shiftDetail}>
          <MCIcon name="calendar-clock" size={16} color={palette.grey} />
          <Text style={styles.shiftDetailText}>
            {formatDate(shift.startDate).date} {formatDate(shift.startDate).time} - {formatDate(shift.endDate).time}
          </Text>
        </View>

        <View style={styles.shiftDetail}>
          <MCIcon name="account-group" size={16} color={palette.grey} />
          <Text style={styles.shiftDetailText}>
            {spotsAvailable} spot{spotsAvailable !== 1 ? "s" : ""} available
            {shift.maxVolunteers ? ` (${shift.maxVolunteers} max)` : ""}
          </Text>
        </View>

        {shift.description && (
          <Text style={[typography.textSm, { color: palette.greyDark, marginTop: 4 }]}>{shift.description}</Text>
        )}

        <View style={styles.shiftActions}>
          {isSignedUp ? (
            <Button
              label="Withdraw"
              variant="outlined"
              dense
              onPress={() => handleWithdrawFromShift(shift._id)}
              loading={isWithdrawing}
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              label={isFull ? "Full" : "Sign Up"}
              dense
              onPress={() => handleSignUpForShift(shift._id, shift.title)}
              loading={isSigningUp}
              disabled={isFull || isClosed}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <AppContainer>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && styles.tabActive]}
          onPress={() => setActiveTab("details")}
        >
          <Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "shifts" && styles.tabActive]}
          onPress={() => setActiveTab("shifts")}
        >
          <Text style={[styles.tabText, activeTab === "shifts" && styles.tabTextActive]}>
            Shifts {Array.isArray(shifts) && shifts.length > 0 ? `(${shifts.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "details" ? (
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
          <Button
            label={alreadyVolunteered ? "Already Volunteered" : isClosed ? "Applications Closed" : "Volunteer for Job"}
            onPress={confirmVolunteer}
            loading={isRegistering}
            disabled={alreadyVolunteered || isClosed}
            style={{ marginTop: 12 }}
          />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {isLoadingShifts ? (
            <Loading center marginVertical={48} />
          ) : Array.isArray(shifts) && shifts.length > 0 ? (
            shifts.map(renderShiftCard)
          ) : (
            <EmptyData title="Shifts" subtitle="No shifts available for this position" icon="calendar-blank" />
          )}
        </View>
      )}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: palette.primary,
  },
  tabText: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.grey,
  },
  tabTextActive: {
    color: palette.primary,
    ...typography.fontSemiBold,
  },
  shiftCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signedUpBadge: {
    backgroundColor: palette.onSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signedUpText: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.secondary,
  },
  shiftDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftDetailText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.greyDark,
  },
  shiftActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
});

export default SingleVolunteersScreen;
