import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useEditProfileMutation, useGetProfileQuery } from "~/store/api/profileApi";
import { updateUser } from "~/store/slices/authSlice";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import Button from "~/components/form/Button";
import TextField from "~/components/form/TextField";
import SelectField from "~/components/form/SelectField";
import { ADMISSION_YEAR, STUDENT_CURRENT_YEAR } from "~/constants/years";
import { INCOME_BRACKETS } from "~/constants/payments";
import * as ImagePicker from "expo-image-picker";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image, Platform, StyleSheet, TextInput, TouchableOpacity, View, Text } from "react-native";
import { palette, typography } from "~/theme";
import { backgroundColor, textColor } from "~/constants/roleColor";
import Toast from "react-native-toast-message";
import { useChapters } from "~/utils/useChapters";

const ProfileEditScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(null, { refetchOnMountOrArgChange: true });
  const [updateProfile, { isLoading }] = useEditProfileMutation();
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const { chapters, isLoading: chaptersLoading } = useChapters(profile?.role);
  const [socials, setSocials] = useState<Array<{ name: string; link: string }>>([]);
  const [addSocialVisible, setAddSocialVisible] = useState(false);
  const [newSocialName, setNewSocialName] = useState("");
  const [newSocialLink, setNewSocialLink] = useState("");

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
      yearsOfExperience: "",
      dateOfBirth: "",
      leadershipPosition: "",
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
        yearsOfExperience: profile?.yearsOfExperience || "",
        dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "",
        leadershipPosition: profile?.leadershipPosition || "",
      });
      setSocials(profile?.socials || []);
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
        mediaTypes: ["images"],
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

      // Append socials
      if (socials.length > 0) {
        formData.append("socials", JSON.stringify(socials));
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
    <AppKeyboardAvoidingView gap={24} withScrollView bottomPadding={120}>
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
        label="dateOfBirth"
        title="Date of Birth"
        placeholder="YYYY-MM-DD"
        control={control}
        errors={errors}
        rules={{ pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: "Use YYYY-MM-DD format" } }}
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
        options={chapters}
        control={control}
        errors={errors}
        required
        disabled={chaptersLoading}
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

          <TextField
            label="yearsOfExperience"
            title="Years of Experience"
            placeholder="e.g. 0 - 5 Years"
            control={control}
            errors={errors}
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
        label="leadershipPosition"
        title="Leadership Position"
        placeholder="Enter your current CMDA leadership position"
        control={control}
        errors={errors}
      />

      <TextField
        label="bio"
        title="About Me"
        placeholder="Enter your some info about yourself"
        numberOfLines={4}
        control={control}
        errors={errors}
        minHeight={120}
      />

      {/* Social Links */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[typography.textLg, typography.fontSemiBold]}>Socials</Text>
          <TouchableOpacity
            onPress={() => setAddSocialVisible(!addSocialVisible)}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <FontAwesome6 name="plus" size={14} color={palette.primary} />
            <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {addSocialVisible && (
          <View style={{ gap: 8, backgroundColor: palette.background, padding: 12, borderRadius: 8 }}>
            <Text style={[typography.textSm, typography.fontMedium]}>Platform</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[styles.socialOption, newSocialName === platform.toLowerCase() && styles.socialOptionSelected]}
                  onPress={() => setNewSocialName(platform.toLowerCase())}
                >
                  <Text style={[typography.textSm, typography.fontMedium, newSocialName === platform.toLowerCase() && { color: palette.white }]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View>
              <Text style={[typography.textSm, typography.fontMedium, { marginBottom: 4 }]}>Link</Text>
              <TextInput
                style={styles.socialInput}
                placeholder="Enter profile URL"
                value={newSocialLink}
                onChangeText={setNewSocialLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <Button
              dense
              label="Add Social"
              onPress={() => {
                if (newSocialName && newSocialLink) {
                  setSocials([...socials, { name: newSocialName, link: newSocialLink }]);
                  setAddSocialVisible(false);
                  setNewSocialName("");
                  setNewSocialLink("");
                } else {
                  Toast.show({ type: "error", text1: "Please select a platform and enter a link" });
                }
              }}
            />
          </View>
        )}

        {socials.map((social, index) => {
          const iconMap: Record<string, string> = {
            facebook: "facebook",
            twitter: "x-twitter",
            instagram: "instagram",
            linkedin: "linkedin",
          };
          const iconName = iconMap[social.name?.toLowerCase()] || "link";
          return (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View style={styles.socialIcon}>
                  <FontAwesome6 name={iconName as any} size={18} color={palette.greyDark} />
                </View>
                <Text style={[typography.textSm, { color: palette.primaryContainer, flex: 1 }]} numberOfLines={1}>
                  {social.link}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSocials(socials.filter((_, i) => i !== index))}>
                <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

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
  socialIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.greyLight,
    borderRadius: 20,
    height: 36,
    width: 36,
  },
  socialOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.greyLight,
    backgroundColor: palette.white,
  },
  socialOptionSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  socialInput: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.greyLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.textBase,
    color: palette.black,
  },
});

export default ProfileEditScreen;
