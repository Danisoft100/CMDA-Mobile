import React, { useState } from "react";
import { Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import SLIcon from "@expo/vector-icons/SimpleLineIcons";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatCurreny } from "~/utils/currencyFormatter";

const HomeScreen = () => {
  const [showBal, setShowBal] = useState(true);
  const { user } = useSelector(selectAuth);

  const wallet: any = {};

  return (
    <AppContainer stickyHeaderIndices={[0]}>
      <View style={{ backgroundColor: palette.background, paddingBottom: 8 }}>
        <View style={styles.header}>
          {user?.avatarUrl ? (
            <Image style={styles.avatar} source={{ uri: user?.avatarUrl }} />
          ) : (
            <View style={styles.avatar}>
              <MCIcon name="account" color={palette.primary} size={28} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: -8 }}>
            <Text style={[typography.textLg, typography.fontSemiBold]}>Hello, {user?.fullName || "User"} </Text>
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <MCIcon name="police-badge" size={16} color={palette.primary} />
              <Text style={[typography.textBase, typography.fontMedium]}>Tier 1</Text>
            </View>
          </View>
          <MCIcon name="message-text" size={24} color={palette.primary} />
          <MCIcon name="bell" size={24} color={palette.primary} />
        </View>
      </View>

      <View style={styles.balCard}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={[styles.balCardRow, { marginBottom: 12 }]} onPress={() => setShowBal(!showBal)}>
            <Text style={[typography.textBase, typography.fontMedium, { color: palette.white }]}>Your balance</Text>
            <MCIcon name={showBal ? "eye-off" : "eye"} color={palette.white} size={16} />
          </TouchableOpacity>
          <Text style={[typography.text2xl, typography.fontSemiBold, { color: palette.white }]}>
            {showBal ? formatCurreny(wallet?.balance) : "************"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity style={[styles.balCardRow, { marginBottom: 16, gap: 4 }]}>
            <Text style={[typography.textSm, typography.fontMedium, { color: palette.white }]}>
              Transaction History
            </Text>
            <MCIcon name="chevron-right" color={palette.white} size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.balCardRow,
              { backgroundColor: "#0004", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
            ]}
          >
            <MCIcon name="plus" color={palette.white} size={20} />
            <Text style={[typography.textSm, typography.fontMedium, { color: palette.white }]}>Add Money</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sendCard}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <View style={styles.sendCardIcon}>
            <Text style={[typography.textXl, typography.fontBold, { color: palette.primary }]}>Fü</Text>
          </View>
          <Text style={[typography.textBase, typography.fontSemiBold]}>To Führer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <View style={styles.sendCardIcon}>
            <MCIcon name="bank" size={24} color={palette.primary} />
          </View>
          <Text style={[typography.textBase, typography.fontSemiBold]}>To Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <View style={styles.sendCardIcon}>
            <MCIcon name="arrow-up" size={24} color={palette.primary} />
          </View>
          <Text style={[typography.textBase, typography.fontSemiBold]}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={[typography.textLg, typography.fontBold]}>Services</Text>
        <View style={styles.service}>
          <TouchableOpacity style={styles.serviceIcon}>
            <MCIcon name="phone" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Airtime</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceIcon}>
            <SLIcon name="globe" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceIcon}>
            <MCIcon name="youtube-tv" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>TV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceIcon}>
            <MCIcon name="dots-horizontal" size={32} color={palette.primary} />
            <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>More</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity>
        <Image source={require("~/assets/images/crypto-explore.png")} style={styles.explore} />
      </TouchableOpacity>

      <View style={styles.transCard}>
        <View style={styles.transCardHeader}>
          <Text style={[typography.textLg, typography.fontSemiBold]}>Transactions</Text>
          <TouchableOpacity>
            <Text style={[typography.textLg, typography.fontSemiBold, { color: palette.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        {[...Array(5)].map((_, x) => (
          <View
            key={x}
            style={[styles.transCardItem, { borderTopWidth: x ? 1 : 0, borderTopColor: palette.black + "12" }]}
          >
            <Image style={styles.transCardItemAvatar} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.textBase, typography.fontMedium]}>Daniel Faraday</Text>
              <Text style={[typography.textSm]}>05:37AM || 26 Feb 20204 </Text>
            </View>
            <Text
              style={[typography.textSm, typography.fontSemiBold, { color: x % 3 ? palette.success : palette.error }]}
            >
              {x % 3 ? "CREDIT" : "DEBIT"}
            </Text>
          </View>
        ))}
      </View>
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
  balCard: {
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  balCardRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  sendCard: {
    backgroundColor: palette.onPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  sendCardIcon: {
    backgroundColor: palette.onPrimaryContainer,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
    marginBottom: 4,
  },
  service: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 4 },
  serviceIcon: {
    backgroundColor: palette.onPrimary,
    height: 80,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  explore: { height: 180, width: "100%", borderRadius: 10, resizeMode: "contain" },
  transCard: {
    borderRadius: 12,
    backgroundColor: palette.onPrimary,
  },
  transCardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: palette.black + "33",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transCardItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transCardItemAvatar: { height: 40, width: 40, backgroundColor: palette.onPrimaryContainer, borderRadius: 64 },
});

export default HomeScreen;
