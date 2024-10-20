import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useEditProfileMutation, useGetProfileQuery } from "~/store/api/profileApi";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import SelectField from "~/components/form/SelectField";
import { DOCTOR_REGIONS, GLOBAL_NETWORK_REGIONS, STUDENT_REGIONS } from "~/constants/regions";
import { ADMISSION_YEAR, STUDENT_CURRENT_YEAR } from "~/constants/years";
import * as ImagePicker from "expo-image-picker";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { palette } from "~/theme";
import { backgroundColor, textColor } from "~/constants/roleColor";
import Toast from "react-native-toast-message";

const ProfileEditScreen = ({ navigation }: any) => {
  const { data: profile } = useGetProfileQuery(null, { refetchOnMountOrArgChange: true });
  const [updateProfile, { isLoading }] = useEditProfileMutation();
  const [userAvatar, setUserAvatar] = useState<any>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    mode: "all",
    defaultValues: {
      licenseNumber: profile?.licenseNumber,
      specialty: profile?.specialty,
      gender: profile?.gender,
      region: profile?.region,
      email: profile?.email,
      firstName: profile?.firstName,
      middleName: profile?.middleName,
      lastName: profile?.lastName,
      phone: profile?.phone,
      bio: profile?.bio,
    },
  });

  const pickImageAsync = async () => {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setUserAvatar(result?.assets?.[0]);
    } else {
      alert("You did not select any image.");
    }
  };

  const onSubmit = (payload: any) => {
    payload = {
      ...payload,
      avatar: userAvatar
        ? {
            uri: Platform.OS === "android" ? userAvatar.uri : userAvatar.uri.replace("file://", ""),
            name: userAvatar.uri.split("/").pop(),
            type: userAvatar?.mimeType,
          }
        : null,
    };
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]: [any, any]) => {
      formData.append(key, value);
    });
    updateProfile(formData)
      .unwrap()
      .then(() => {
        Toast.show({
          type: "success",
          text1: `Profile updated successfully`,
        });
        navigation.goBack();
      });
  };

  return (
    <AppKeyboardAvoidingView gap={24} withScrollView>
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity onPress={pickImageAsync}>
          {userAvatar || profile?.avatarUrl ? (
            <Image source={{ uri: userAvatar?.uri || profile?.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: backgroundColor[profile?.role] }]}>
              <MCIcon name="account" size={80} color={textColor[profile?.role]} />
            </View>
          )}
        </TouchableOpacity>
      </View>

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
        disabled
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
          profile?.role === "Student"
            ? STUDENT_REGIONS
            : profile?.role === "Doctor"
            ? DOCTOR_REGIONS
            : GLOBAL_NETWORK_REGIONS
        }
        control={control}
        errors={errors}
        required
      />

      {profile?.role === "Student" ? (
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
        </>
      )}

      <TextField
        label="bio"
        title="About Me"
        placeholder="Enter your some info about yourself"
        numberOfLines={4}
        control={control}
        errors={errors}
        minHeight={120}
      />

      <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </AppKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 64,
    overflow: "hidden",
  },
  avatarIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderRadius: 64,
    height: 120,
    width: 120,
  },
});

export default ProfileEditScreen;
