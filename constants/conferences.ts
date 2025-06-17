// Conference-specific constants for the mobile app
export const CONFERENCE_TYPES = [
  { value: 'National', label: 'National Conference' },
  { value: 'Zonal', label: 'Zonal Conference' },
  { value: 'Regional', label: 'Regional Conference' },
];

export const CONFERENCE_ZONES = [
  { value: 'Western', label: 'Western Zone' },
  { value: 'Eastern', label: 'Eastern Zone' },
  { value: 'Northern', label: 'Northern Zone' },
];

export const CONFERENCE_REGIONS = [
  { value: 'Americas & Caribbean', label: 'Americas & Caribbean Region' },
  { value: 'UK/Europe', label: 'UK/Europe Region' },
  { value: 'Australia/Asia', label: 'Australia/Asia Region' },
  { value: 'Middle East', label: 'Middle East Region' },
  { value: 'Africa', label: 'Africa Region' },
];

// Updated member groups with new doctor categories
export const MEMBER_GROUPS = [
  { value: 'Student', label: 'Student' },
  { value: 'Doctor_0_5_years', label: 'Doctors (0-5 years)' },
  { value: 'Doctor_Above_5_years', label: 'Doctors (Above 5 years)' },
  { value: 'GlobalNetwork', label: 'Global Network' },
];

// Legacy member groups for backward compatibility
export const LEGACY_MEMBER_GROUPS = [
  { value: 'Student', label: 'Student' },
  { value: 'Doctor', label: 'Doctor' },
  { value: 'GlobalNetwork', label: 'Global Network' },
];

// Helper function to get member group display name
export const getMemberGroupLabel = (value: string): string => {
  const group = MEMBER_GROUPS.find(g => g.value === value) || 
                LEGACY_MEMBER_GROUPS.find(g => g.value === value);
  return group?.label || value;
};

// Helper function to check if user can see a conference based on member groups
export const canUserSeeConference = (userRole: string, conferenceGroups: string[]): boolean => {
  if (!conferenceGroups || conferenceGroups.length === 0) return true;
  
  // Handle legacy Doctor role mapping to new categories
  if (userRole === 'Doctor') {
    return conferenceGroups.some(group => 
      group === 'Doctor' || 
      group === 'Doctor_0_5_years' || 
      group === 'Doctor_Above_5_years'
    );
  }
  
  return conferenceGroups.includes(userRole);
};

// Helper function to get user's member group for API calls
export const getUserMemberGroup = (user: any): string => {
  if (!user?.role) return 'Student';
  
  // Handle doctor experience-based categorization
  if (user.role === 'Doctor') {
    const yearsOfExperience = user.yearsOfExperience || 0;
    return yearsOfExperience <= 5 ? 'Doctor_0_5_years' : 'Doctor_Above_5_years';
  }
  
  return user.role;
};
