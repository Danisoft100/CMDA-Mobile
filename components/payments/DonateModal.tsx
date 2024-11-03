import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Switch,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import SelectField from "../form/SelectField";
import TextField from "../form/TextField";
import { useForm } from "react-hook-form";
import Button from "../form/Button";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { AREAS_OF_NEED, AREAS_OF_NEED_GLOBAL } from "~/constants/payments";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IDonateModal {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  loading: boolean;
}

const DonateModal = ({ visible, onClose, onSubmit, loading }: IDonateModal) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: "all" });

  const [visionPartner, setVisionPartner] = useState(false);

  const { user } = useSelector(selectAuth);

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const onPreSubmit = (payload: any) => {
    payload = { ...payload, amount: +payload.amount, recurring: visionPartner };
    onSubmit(payload);
  };

  const insets = useSafeAreaInsets();

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={[styles.modalContainer, { paddingBottom: insets.bottom }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <Text style={[typography.textXl, typography.fontSemiBold, { textTransform: "capitalize" }]}>
                New Donation
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <TextField label="amount" control={control} keyboardType="number-pad" errors={errors} required />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Switch
                  trackColor={{ false: palette.greyLight, true: palette.primary }}
                  thumbColor={palette.white}
                  ios_backgroundColor={palette.greyLight}
                  style={styles.switch}
                  onValueChange={(val) => setVisionPartner(val)}
                  value={visionPartner}
                />
                <Text style={[typography.textBase, typography.fontSemiBold]}>Vision partner?</Text>
              </View>

              {visionPartner ? (
                <SelectField
                  label="frequency"
                  options={["Monthly", "Annually"]}
                  control={control}
                  errors={errors}
                  required
                />
              ) : null}

              <SelectField
                label="areasOfNeed"
                options={user?.role === "GlobalNetwork" ? AREAS_OF_NEED_GLOBAL : AREAS_OF_NEED}
                control={control}
                errors={errors}
                required
              />

              <Button label={"Make Donation"} onPress={() => handleSubmit(onPreSubmit)()} loading={loading} />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    minHeight: "65%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  switch: { transform: [{ scaleX: 0.65 }, { scaleY: 0.6 }] },
});

export default DonateModal;
