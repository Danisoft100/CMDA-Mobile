import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import { typography } from "~/theme";

const BvnScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  //   const [submitBvn, { isLoading }] = useSetPinMutation();

  const onSubmit = (payload: any) => {
    // submitBvn(payload)
    //   .unwrap()
    //   .then(() => {
    Toast.show({ type: "success", text1: "BVN submitted successful" });
    navigation.navigate("nin");
    //   });
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Enter Your BVN</Text>

      <TextField
        label="bvn"
        title="Enter BVN"
        placeholder="Please enter 11 digits BVN"
        keyboardType="number-pad"
        control={control}
        errors={errors}
        required
        rules={{
          minLength: { value: 11, message: "BVN must be 11 digits" },
          maxLength: { value: 11, message: "BVN must be 11 digits" },
        }}
      />

      <Button label="Next" onPress={handleSubmit(onSubmit)} loading={false} />
    </AppKeyboardAvoidingView>
  );
};

export default BvnScreen;
