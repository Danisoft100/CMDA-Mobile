import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import { useDispatch } from "react-redux";
import { logout } from "~/store/slices/authSlice";
import { persistor } from "~/store/store";

const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    navigation.navigate("onboarding");
  };

  return (
    <AppContainer>
      <TouchableOpacity style={styles.item}>
        <MCIcon name="close-circle" size={24} color={palette.primary} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[typography.textLg, typography.fontMedium]}>Close Account</Text>
        </View>
        <MCIcon name="chevron-right" size={24} color={palette.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={handleLogout}>
        <MCIcon name="logout" size={24} color={palette.error} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[typography.textLg, typography.fontMedium]}>Log out</Text>
        </View>
      </TouchableOpacity>
    </AppContainer>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: palette.grey,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    backgroundColor: palette.primaryLight + "22",
  },
});
