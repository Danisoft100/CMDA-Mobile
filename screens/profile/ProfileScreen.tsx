import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";

const ProfileScreen = ({ navigation }: any) => {
  const OPTIONS1 = [
    { icon: "clock-outline", title: "Transaction History", subtitle: "" },
    { icon: "tag", title: "Statements/Reports", subtitle: "Download monthly statements" },
    { icon: "tag", title: "Referrals", subtitle: "Get paid when you refer a friend" },
  ];

  const OPTIONS2 = [
    { icon: "shield-check", title: "Security", subtitle: "" },
    { icon: "headphones", title: "Customer service", subtitle: "" },
    { icon: "tag", title: "Legal", subtitle: "About our contract with you" },
    { icon: "cog", title: "Settings", subtitle: "", screen: "profile-settings" },
  ];

  return (
    <AppContainer withScrollView={false} backgroundColor={palette.primary} padding={0}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, gap: 12 }}>
        <View style={[styles.row]}>
          <Image style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.textLg, typography.fontBold, { color: "white" }]}>Michael Amos</Text>
            <View style={[styles.row, { gap: 6 }]}>
              <MCIcon name="police-badge" size={16} color={palette.white} />
              <Text style={[typography.textBase, typography.fontMedium, { color: "white" }]}>Tier 1</Text>
            </View>
          </View>
        </View>
        <View>
          <TouchableOpacity style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text style={[typography.textBase, typography.fontMedium, { color: palette.white }]}>Your balance</Text>
            <MCIcon name="eye" color={palette.white} size={16} />
          </TouchableOpacity>
          <Text style={[typography.text2xl, typography.fontBold, { color: palette.white }]}>₦50,000,000.75</Text>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={styles.listItemCard}>
            {OPTIONS1.map((item: any, i) => (
              <TouchableOpacity key={i} style={[styles.listItem, { borderTopWidth: i ? 1 : 0 }]}>
                <MCIcon name={item.icon} size={24} color={palette.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textLg, typography.fontMedium]}>{item.title}</Text>
                  {item.subtitle && <Text style={[typography.textSm, { marginTop: -4 }]}>{item.subtitle}</Text>}
                </View>
                <MCIcon name="chevron-right" size={24} color={palette.black} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.listItemCard}>
            {OPTIONS2.map((item: any, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.listItem, { borderTopWidth: i ? 1 : 0 }]}
                onPress={item.screen ? () => navigation.navigate("profile-settings") : () => {}}
              >
                <MCIcon name={item.icon} size={24} color={palette.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textLg, typography.fontMedium]}>{item.title}</Text>
                  {item.subtitle && <Text style={[typography.textSm, { marginTop: -4 }]}>{item.subtitle}</Text>}
                </View>
                <MCIcon name="chevron-right" size={24} color={palette.black} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 16, alignItems: "center" },
  avatar: { height: 48, width: 48, backgroundColor: palette.primaryLight, borderRadius: 64 },
  listItemCard: {
    borderWidth: 1,
    borderColor: palette.grey,
    borderRadius: 10,
    backgroundColor: palette.white,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderColor: palette.grey,
  },
});

export default ProfileScreen;
