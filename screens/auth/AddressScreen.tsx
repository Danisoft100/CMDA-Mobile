import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import SelectField from "~/components/form/SelectField";
import TextField from "~/components/form/TextField";
import { STATESLGA } from "~/constants/StatesLga";
import { typography } from "~/theme";

const AddressScreen = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm({ mode: "all" });

  //   const [setAddress, { isLoading }] = useAddressMutation();

  const handleAddress = (payload: any) => {
    // setAddress(payload)
    //   .unwrap()
    //   .then(() => {
    Toast.show({ type: "success", text1: "Address saved successful" });
    navigation.navigate("tab");
    //   });
  };
  return (
    <AppKeyboardAvoidingView>
      <Text style={[typography.text2xl, typography.fontBold]}>Enter your Address</Text>
      <Text style={[typography.textBase, typography.fontMedium]}>
        Please enter full details of your current address
      </Text>

      <SelectField
        control={control}
        label="state"
        placeholder="Select state"
        errors={errors}
        options={Object.keys(STATESLGA).map((v) => ({ label: v, value: v }))}
        onSelect={() => setValue("lga", null)}
        required
      />

      <SelectField
        control={control}
        label="lga"
        title="LGA"
        errors={errors}
        options={(STATESLGA as any)[watch("state")]?.map((v: any) => ({ label: v, value: v })) || []}
        required
      />

      <TextField label="city" placeholder="Enter city" control={control} errors={errors} required />

      <TextField
        label="addressDetails"
        placeholder="e.g. 7 Cristiano Street"
        control={control}
        errors={errors}
        required
      />

      <Button label="Submit" onPress={handleSubmit(handleAddress)} loading={false} />
    </AppKeyboardAvoidingView>
  );
};

export default AddressScreen;
