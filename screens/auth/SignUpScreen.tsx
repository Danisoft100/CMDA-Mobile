import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const SignUpScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState("");

  const ACCOUNT_TYPES = [
    {
      label: "Student",
      value: "Student",
      requires: "requires admission year & student chapter",
      icon: <FontAwesome6 name="user-graduate" size={28} color="black" />,
      background: palette.onPrimary,
      selected: palette.primary,
    },
    {
      label: "Doctor",
      value: "Doctor",
      requires: "requires license number, specialty & state chapter",
      icon: <Fontisto name="doctor" size={32} color="black" />,
      background: palette.onSecondary,
      selected: palette.secondary,
    },
    {
      label: "Global Network Member",
      value: "GlobalNetwork",
      requires: "requires license number, specialty & state chapter",
      icon: <MCIcons name="doctor" size={40} color="black" />,
      background: palette.onTertiary,
      selected: palette.tertiary,
    },
  ];

  const handleSubmit = () => {
    if (!selected) return Toast.show({ type: "error", text1: "Please select an account type" });
    navigation.navigate("sign-up-2", { accountType: selected });
  };

  return (
    <AppKeyboardAvoidingView gap={20} withScrollView>
      <Text style={[typography.textBase, typography.fontMedium]}>Select an account type to get started</Text>

      <View style={{ gap: 16 }}>
        {ACCOUNT_TYPES.map((acct) => (
          <TouchableOpacity
            style={[
              { alignItems: "center", backgroundColor: acct.background, padding: 20, borderRadius: 24 },
              {
                borderWidth: selected === acct.value ? 2 : 0,
                borderColor: selected === acct.value ? acct.selected : "transparent",
              },
            ]}
            key={acct.label}
            onPress={() => setSelected(acct.value)}
          >
            {acct.icon}
            <Text style={[typography.textLg, typography.fontSemiBold]}>{acct.label}</Text>
            <Text style={[typography.textXs, typography.fontMedium, { textTransform: "capitalize" }]}>
              <Text style={{ color: palette.error }}>*</Text> {acct.requires}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Continue" onPress={handleSubmit} />
    </AppKeyboardAvoidingView>
  );
};

export default SignUpScreen;
