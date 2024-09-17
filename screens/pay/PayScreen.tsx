import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import TextField from "~/components/form/TextField";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

const PayScreen = () => {
  const { control } = useForm({ mode: "all" });
  return (
    <AppContainer>
      <Text style={[typography.text2xl, typography.fontBold]}>Pay Bills</Text>

      <TextField
        label="search"
        control={control}
        errors={{}}
        icon="magnify"
        placeholder="Search for a biller"
        showLabel={false}
      />

      <View style={styles.billCard}>
        <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 8 }]}>Favorites</Text>
        <View style={styles.billCardRow}>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="phone" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Airtime</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="wifi-arrow-up-down" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.billCard}>
        <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 8 }]}>Utilities</Text>
        <View style={styles.billCardRow}>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="youtube-tv" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>TV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="web" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Internet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="water" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Water</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="flash" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Electricity</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.billCard}>
        <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 8 }]}>Education</Text>
        <View style={styles.billCardRow}>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="school" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="microsoft-onenote" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>NECO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billCardItem}>
            <MCIcon name="account-group" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>
              Associates & Societies
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  billCard: {
    borderWidth: 1,
    borderColor: palette.grey,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.primaryLight + "66",
    borderRadius: 12,
  },
  billCardRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  billCardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});

export default PayScreen;
