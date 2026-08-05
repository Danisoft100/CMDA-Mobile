import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import Loading from "~/components/Loading";
import Button from "~/components/form/Button";
import {
  useGetMyApplicationsQuery,
  useWithdrawApplicationMutation,
  useGetMyShiftsQuery,
} from "~/store/api/volunteerApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: palette.onTertiary, text: palette.tertiary },
  approved: { bg: palette.onSecondary, text: palette.secondary },
  rejected: { bg: palette.error + "33", text: palette.error },
};

const MyVolunteerApplicationsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<"applications" | "shifts">("applications");

  const {
    data: applicationsData,
    isLoading: isLoadingApps,
    isFetching: isFetchingApps,
    refetch: refetchApps,
  } = useGetMyApplicationsQuery({});
  const {
    data: shiftsData,
    isLoading: isLoadingShifts,
    isFetching: isFetchingShifts,
    refetch: refetchShifts,
  } = useGetMyShiftsQuery({});
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const applications = applicationsData?.items || applicationsData || [];
  const shifts = shiftsData?.items || shiftsData || [];

  const handleWithdraw = (jobId: string, jobTitle: string) => {
    Alert.alert("Withdraw Application", `Are you sure you want to withdraw from "${jobTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: async () => {
          try {
            await withdrawApplication(jobId).unwrap();
            Toast.show({ type: "success", text1: "Application withdrawn successfully" });
            refetchApps();
          } catch (error: any) {
            Toast.show({ type: "error", text1: error?.data?.message || "Unable to withdraw application" });
          }
        },
      },
    ]);
  };

  const renderApplicationCard = (app: any) => {
    const job = app.job || app;
    const status = (app.status || "pending").toLowerCase();
    const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

    return (
      <TouchableOpacity
        key={app._id || job._id}
        style={styles.card}
        onPress={() => navigation.navigate("home-volunteers-single", { id: job._id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.textBase, typography.fontSemiBold]} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={[typography.textSm, { color: palette.greyDark }]}>{job.companyName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MCIcon name="map-marker" size={14} color={palette.grey} />
          <Text style={styles.detailText}>{job.companyLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <MCIcon name="calendar" size={14} color={palette.grey} />
          <Text style={styles.detailText}>
            Applied {formatDate(app.createdAt || app.appliedAt).date}
          </Text>
        </View>

        {status === "pending" && (
          <Button
            label="Withdraw Application"
            variant="outlined"
            dense
            onPress={() => handleWithdraw(job._id, job.title)}
            loading={isWithdrawing}
            style={{ marginTop: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderShiftCard = (shift: any) => {
    const job = shift.job || shift;
    const status = (shift.status || "confirmed").toLowerCase();

    return (
      <View key={shift._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[typography.textBase, typography.fontSemiBold, { flex: 1 }]} numberOfLines={1}>
            {shift.title || job.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status === "confirmed" ? palette.onSecondary : palette.onTertiary }]}>
            <Text style={[styles.statusText, { color: status === "confirmed" ? palette.secondary : palette.tertiary }]}>
              {status}
            </Text>
          </View>
        </View>

        {job.companyName && (
          <View style={styles.detailRow}>
            <MCIcon name="office-building" size={14} color={palette.grey} />
            <Text style={styles.detailText}>{job.companyName}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <MCIcon name="calendar-clock" size={14} color={palette.grey} />
          <Text style={styles.detailText}>
            {formatDate(shift.startDate).date} {formatDate(shift.startDate).time} - {formatDate(shift.endDate).time}
          </Text>
        </View>

        {shift.job?._id && (
          <TouchableOpacity
            onPress={() => navigation.navigate("home-volunteers-single", { id: shift.job._id })}
            style={{ marginTop: 8 }}
          >
            <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>
              View Position
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <AppContainer gap={12}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "applications" && styles.tabActive]}
          onPress={() => setActiveTab("applications")}
        >
          <Text style={[styles.tabText, activeTab === "applications" && styles.tabTextActive]}>
            Applications {Array.isArray(applications) && applications.length > 0 ? `(${applications.length})` : ""}
          </Text>
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

      {activeTab === "applications" ? (
        isLoadingApps ? (
          <Loading center marginVertical={48} />
        ) : Array.isArray(applications) && applications.length > 0 ? (
          applications.map(renderApplicationCard)
        ) : (
          <EmptyData title="Applications" subtitle="You haven't applied to any volunteer positions yet" icon="briefcase-outline" />
        )
      ) : isLoadingShifts ? (
        <Loading center marginVertical={48} />
      ) : Array.isArray(shifts) && shifts.length > 0 ? (
        shifts.map(renderShiftCard)
      ) : (
        <EmptyData title="Shifts" subtitle="You haven't signed up for any shifts yet" icon="calendar-blank" />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: palette.white,
    borderRadius: 10,
    overflow: "hidden",
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
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    textTransform: "capitalize",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.greyDark,
  },
});

export default MyVolunteerApplicationsScreen;
