import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useEditProfileMutation, useGetProfileQuery } from "~/store/api/profileApi";
import { updateUser } from "~/store/slices/authSlice";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import SelectField from "~/components/form/SelectField";
import { DOCTOR_REGIONS, GLOBAL_NETWORK_REGIONS, STUDENT_REGIONS } from "~/constants/regions";
import { ADMISSION_YEAR, STUDENT_CURRENT_YEAR } from "~/constants/years";
import { INCOME_BRACKETS } from "~/constants/payments";
import * as ImagePicker from "expo-image-picker";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, Platform, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { palette } from "~/theme";
import { backgroundColor, textColor } from "~/constants/roleColor";
import Toast from "react-native-toast-message";

const ProfileEditScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(null, { refetchOnMountOrArgChange: true });
  const [updateProfile, { isLoading }] = useEditProfileMutation();
  const [userAvatar, setUserAvatar] = useState<any>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      licenseNumber: "",
      specialty: "",
      gender: "",
      region: "",
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      bio: "",
      incomeBracket: "",
      admissionYear: "",
      yearOfStudy: "",
    },
  });

  // Reset form with profile data when it loads
  React.useEffect(() => {
    if (profile) {
      reset({
        licenseNumber: profile?.licenseNumber || "",
        specialty: profile?.specialty || "",
        gender: profile?.gender || "",
        region: profile?.region || "",
        email: profile?.email || "",
        firstName: profile?.firstName || "",
        middleName: profile?.middleName || "",
        lastName: profile?.lastName || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        incomeBracket: profile?.incomeBracket || "",
        admissionYear: profile?.admissionYear || "",
        yearOfStudy: profile?.yearOfStudy || "",
      });
    }
  }, [profile, reset]);

  const pickImageAsync = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: "error",
          text1: "Permission required",
          text2: "Please allow access to your photo library to upload an avatar",
        });
        return;
      }

      let result: any = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8, // Reduce quality to prevent large file issues
        aspect: [1, 1], // Square aspect ratio
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUserAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image. Please try again.",
      });
    }
  };

  const onSubmit = (data: any) => {
    try {
      const formData = new FormData();

      // Append form fields, excluding null/undefined values
      Object.entries(data).forEach(([key, value]: [any, any]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Append avatar if selected
      if (userAvatar) {
        const uri = Platform.OS === "android" ? userAvatar.uri : userAvatar.uri.replace("file://", "");
        const filename = userAvatar.uri.split("/").pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = userAvatar.mimeType || (match ? `image/${match[1]}` : `image/jpeg`);

        formData.append("avatar", {
          uri,
          name: filename,
          type,
        } as any);
      }

      updateProfile(formData)
        .unwrap()
        .then((response) => {
          // Update Redux store with new user data
          if (response?.data) {
            dispatch(updateUser(response.data));
          }
          
          Toast.show({
            type: "success",
            text1: `Profile updated successfully`,
          });
          navigation.goBack();
        })
        .catch((error) => {
          console.error('Profile update error:', error);
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: error?.message || "Please check your information and try again",
          });
        });
    } catch (error) {
      console.error('Profile submission error:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to prepare profile data. Please try again.",
      });
    }
  };

  // Don't render form until profile is loaded
  if (profileLoading || !profile) {
    return (
      <AppKeyboardAvoidingView gap={24} withScrollView>
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text>Loading profile...</Text>
        </View>
      </AppKeyboardAvoidingView>
    );
  }

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
          />          <TextField
            label="specialty"
            placeholder="E.g. Dentist, Ophthalmologist, Gynecologist"
            control={control}
            errors={errors}
            required
          />

          {profile?.role === "GlobalNetwork" && (
            <SelectField
              label="incomeBracket"
              title="Annual Income Level"
              placeholder="Select your income bracket"
              options={INCOME_BRACKETS}
              control={control}
              errors={errors}
              required
            />
          )}
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

      <Button 
        label="Save Changes" 
        onPress={handleSubmit(onSubmit)} 
        loading={isLoading || profileLoading} 
        disabled={profileLoading}
      />
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
