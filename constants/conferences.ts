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

export const REGISTRATION_PERIODS = [
  { value: 'Regular', label: 'Regular Registration' },
  { value: 'Late', label: 'Late Registration' },
];

// Zone mapping for different audience types
export const ZONAL_CONFERENCE_TYPES = {
  Student: 'Student Zonal Conference',
  Doctor: 'Doctor Zonal Conference',
  GlobalNetwork: 'Global Network Conference',
} as const;
