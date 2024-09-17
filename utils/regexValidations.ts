export const EMAIL_PATTERN =
  /^[a-zA-Z][a-zA-Z0-9._+-]*[a-zA-Z0-9]+@[a-zA-Z][a-zA-Z0-9-_]*(\.[a-zA-Z]+)+$/;

export const PHONE_NUMBER_NG = /^\d{11}$/; // e.g. 08012345678

export const ACCOUNT_NUMBER = /^\d{10}$/; // e.g. 0012345678

export const FULLNAME_PATTERN = /^[a-zA-Z][a-zA-Z\s.'-]*[a-zA-Z]$/; // e.g. 'John Doe', 'T. O. Anita'

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/; // - alphabets, numbers and underscore only

// Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_-])[A-Za-z\d@$!%*?&#_-]{8,}$/;
