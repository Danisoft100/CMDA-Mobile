import React from "react";
import { StyleSheet, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { useDispatch } from "react-redux";
import { logout } from "~/store/slices/authSlice";
import { persistor } from "~/store/store";

const MoreOptionScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout", // title
      "Are you sure you want to log out?", // subtitle
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            dispatch(logout());
            navigation.navigate("splash");
          },
          style: "destructive", // Use a red color for the destructive action
        },
      ],
      { cancelable: true } // Allow user to dismiss the alert by tapping outside
    );
  };

  const OPTIONS = [
    { title: "Profile", screen: "more-profile", icon: "account" },
    { title: "Messages", screen: "more-messages", icon: "message-text-outline" },
    { title: "Store", screen: "more-store", icon: "shopping" },
    { title: "Settings", screen: "more-settings", icon: "cog-outline" },
    { title: "Logout", action: handleLogout, icon: "logout" },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() => {
        if (item.action) item.action();
        else navigation.navigate(item.screen);
      }}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={24}
        color={item.icon === "logout" ? palette.error : palette.primary}
      />
      <Text
        style={[
          typography.textLg,
          typography.fontMedium,
          { color: item.icon === "logout" ? palette.error : palette.greyDark, marginLeft: 16 },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AppContainer withScrollView={false}>
      <Text style={[typography.textXl, typography.fontBold]}>More Options</Text>

      <FlatList
        data={OPTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContainer}
      />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 15,
  },
});

export default MoreOptionScreen;
