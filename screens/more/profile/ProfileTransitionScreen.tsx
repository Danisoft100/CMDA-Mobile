import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import SelectField from "~/components/form/SelectField";
import TextField from "~/components/form/TextField";
import { useGetTransitionQuery, useInitiateTransitionMutation } from "~/store/api/profileApi";
import { selectAuth } from "~/store/slices/authSlice";
import { useChapters } from "~/utils/useChapters";
import { palette, typography } from "~/theme";

const ProfileTransitionScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);
  const targetRole = user?.role === "Student" ? "Doctor" : "GlobalNetwork";
  const { chapters, isLoading: chaptersLoading } = useChapters(targetRole);
  const { data: transition } = useGetTransitionQuery(null, { refetchOnMountOrArgChange: true });
  const [initiateTransition, { isLoading }] = useInitiateTransitionMutation();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ mode: "all" });

  useEffect(() => {
    if (transition) reset(transition);
  }, [reset, transition]);

  const onSubmit = async (payload: any) => {
    try {
      await initiateTransition({
        ...payload,
        ...(user?.role === "Doctor" ? { specialty: user?.specialty, licenseNumber: user?.licenseNumber } : {}),
      }).unwrap();
      Toast.show({ type: "success", text1: transition ? "Transition updated" : "Transition started" });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: "error", text1: error || "Transition could not be submitted" });
    }
  };

  return (
    <AppKeyboardAvoidingView gap={16} withScrollView>
      {transition ? (
        <View style={{ backgroundColor: palette.onPrimary, padding: 12, borderRadius: 8 }}>
          <Text style={[typography.textSm, { color: palette.primary }]}>A transition is already in progress. You can update its details below.</Text>
        </View>
      ) : null}
      <SelectField
        control={control}
        label="region"
        title="New Chapter/Region"
        placeholder={chaptersLoading ? "Loading chapters…" : "Select the new chapter/region"}
        options={chapters}
        errors={errors}
        required
        disabled={chaptersLoading}
      />
      {user?.role === "Student" ? (
        <>
          <TextField control={control} label="specialty" title="Professional Cadre / Specialty" errors={errors} required placeholder="Enter AWAITING if not yet available" />
          <TextField control={control} label="licenseNumber" title="License Number" errors={errors} required placeholder="Enter AWAITING if not yet available" />
        </>
      ) : null}
      <Button label={transition ? "Update Transition" : "Start Transition"} onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

export default ProfileTransitionScreen;
