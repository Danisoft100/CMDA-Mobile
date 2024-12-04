import React from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import SelectField from "~/components/form/SelectField";
import TextField from "~/components/form/TextField";
import { DOCTOR_REGIONS, GLOBAL_NETWORK_REGIONS, STUDENT_REGIONS } from "~/constants/regions";
import { ADMISSION_YEAR, STUDENT_CURRENT_YEAR } from "~/constants/years";
import { useSignUpMutation } from "~/store/api/authApi";
import { palette, typography } from "~/theme";
import { EMAIL_PATTERN, PASSWORD_PATTERN } from "~/utils/regexValidations";

const SignUp2Screen = ({ navigation, route }: any) => {
  const { accountType } = route.params;

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" });

  const [signUp, { isLoading }] = useSignUpMutation();

  const onSubmit = (payload: any) => {
    signUp({ ...payload, admissionYear: +payload.admissionYear, role: accountType })
      .unwrap()
      .then((res) => {
        Toast.show({
          type: "success",
          text1: `${accountType} account created successfully`,
          text2: "Check your email for verification token",
        });
        navigation.navigate("verify", { email: payload.email });
      });
  };

  return (
    <AppKeyboardAvoidingView gap={24} withScrollView>
      <Text style={[typography.textLg, typography.fontSemiBold, { marginTop: -16, textAlign: "center" }]}>
        Create a {accountType?.toUpperCase()} account
      </Text>

      <TextField
        label="firstName"
        title="First Name"
        placeholder="Enter your first name"
        control={control}
        errors={errors}
        required
      />

      <TextField
        label="middleName"
        title="Middle Name (optional)"
        placeholder="Enter your middle name"
        control={control}
        errors={errors}
      />

      <TextField
        label="lastName"
        title="Last Name"
        placeholder="Enter your last name"
        control={control}
        errors={errors}
        required
      />

      <TextField
        label="phone"
        title="Phone Number (optional)"
        keyboardType="phone-pad"
        placeholder="e.g. +2348032616345"
        control={control}
        errors={errors}
      />

      <TextField
        label="email"
        title="Email Address"
        placeholder="Enter your email address"
        keyboardType="email-address"
        control={control}
        errors={errors}
        required
        rules={{
          pattern: { value: EMAIL_PATTERN, message: "Invalid email address" },
        }}
      />

      <TextField
        title="Password"
        control={control}
        label="password"
        type="password"
        placeholder="Enter password"
        errors={errors}
        required
        rules={{
          minLength: { value: 8, message: "Must be at least 8 characters" },
          pattern: {
            value: PASSWORD_PATTERN,
            message: "Password must contain lowercase, uppercase, special character & number",
          },
        }}
      />

      <TextField
        title="Confirm Password"
        control={control}
        label="confirmPassword"
        type="password"
        placeholder="Enter password again"
        errors={errors}
        required
        rules={{
          minLength: { value: 8, message: "Must be at least 8 characters" },
          pattern: {
            value: PASSWORD_PATTERN,
            message: "Password must contain lowercase, uppercase, special character & number",
          },
          validate: (value: string) => value === watch("password") || "Passwords do not match",
        }}
      />

      <SelectField
        label="gender"
        options={["Male", "Female"]}
        placeholder="Select your gender"
        control={control}
        errors={errors}
        required
      />

      <SelectField
        label="region"
        title="Chapter/Region"
        placeholder="Choose your chapter/region"
        options={
          accountType === "Student"
            ? STUDENT_REGIONS
            : accountType === "Doctor"
            ? DOCTOR_REGIONS
            : GLOBAL_NETWORK_REGIONS
        }
        control={control}
        errors={errors}
        required
      />

      {accountType === "Student" ? (
        <>
          <SelectField
            label="admissionYear"
            options={ADMISSION_YEAR.map((x) => String(x))}
            title="Admission Year"
            placeholder="Choose year of admission"
            control={control}
            errors={errors}
            required
          />

          <SelectField
            label="yearOfStudy"
            options={STUDENT_CURRENT_YEAR}
            title="Current year of study"
            placeholder="Select your current level/year"
            control={control}
            errors={errors}
            required
          />
        </>
      ) : (
        <>
          <TextField
            label="licenseNumber"
            placeholder="Enter your license number"
            required
            control={control}
            errors={errors}
          />

          <TextField
            label="specialty"
            placeholder="E.g. Dentist, Ophthalmologist, Gynecologist"
            control={control}
            errors={errors}
            required
          />

          <SelectField
            label="yearsOfExperience"
            options={["0 - 5 Years", "5 Years and Above"]}
            placeholder="Select your current level/year"
            control={control}
            errors={errors}
            required
          />
        </>
      )}

      <Button label="Continue" onPress={handleSubmit(onSubmit)} loading={isLoading} />

      <View style={{ flexDirection: "row", paddingBottom: 20 }}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginRight: 4 }]}>
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-in")}>
          <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AppKeyboardAvoidingView>
  );
};

export default SignUp2Screen;
