type ProfileField = { key: string; label: string };

const BASE_FIELDS: ProfileField[] = [
  { key: "avatarUrl", label: "profile photo" },
  { key: "phone", label: "phone number" },
  { key: "gender", label: "gender" },
  { key: "region", label: "region" },
  { key: "bio", label: "bio" },
];

const ROLE_FIELDS: Record<string, ProfileField[]> = {
  Student: [
    { key: "admissionYear", label: "admission year" },
    { key: "yearOfStudy", label: "year of study" },
  ],
  Doctor: [
    { key: "licenseNumber", label: "licence number" },
    { key: "specialty", label: "specialty" },
    { key: "yearsOfExperience", label: "years of experience" },
  ],
  GlobalNetwork: [
    { key: "specialty", label: "specialty" },
    { key: "yearsOfExperience", label: "years of experience" },
  ],
};

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && (typeof value !== "string" || value.trim().length > 0);

export const missingProfileFields = (user: any): string[] => {
  if (!user) return [];
  const fields = [...BASE_FIELDS, ...(ROLE_FIELDS[user.role] || [])];
  return fields.filter(({ key }) => !hasValue(user[key])).map(({ label }) => label);
};

export const isProfileComplete = (user: any): boolean => missingProfileFields(user).length === 0;
