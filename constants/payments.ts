export const AREAS_OF_NEED = [
  "General Donation",
  "National Secretariat",
  "Building Project",
  "Wholeness Missions",
  "Wholeness Journal",
  "Institute of Medical Missions (IMM)",
  "Institute for Excellence in Healthcare and Leadership (IfEHL)",
  "Touch Magazine",
  "CMDA Nigeria Join Conference",
];

export const AREAS_OF_NEED_GLOBAL = [
  "General Donation",
  "Missions",
  "Regional Meeting",
  "Administration",
  "Building Project",
  "CMDA Nigeria Join Conference",
];


export const SUBSCRIPTION_PRICES = {
  Student: 1000,
  Doctor: 10000,
  DoctorSenior: 20000,
  GlobalNetwork: 10000,
  LifeMember: 250000,
};

// Income-based pricing for Global Network members (USD)
export const GLOBAL_INCOME_BASED_PRICING = {
  greater_than_200k: {
    label: "Greater than $200,000",
    monthly: 40,
    annual: 400,
  },
  "100k_to_200k": {
    label: "$100,000-$200,000",
    monthly: 30,
    annual: 300,
  },
  "50k_to_100k": {
    label: "$50,000-$100,000",
    monthly: 20,
    annual: 200,
  },
  less_than_50k: {
    label: "Less than $50,000",
    monthly: 10,
    annual: 100,
  },
  students_unemployed: {
    label: "Students/Unemployed",
    monthly: 1,
    annual: 10,
  },
};

// Lifetime membership options (USD)
export const LIFETIME_MEMBERSHIPS = {
  gold: {
    label: "Lifetime Gold (15 years)",
    price: 6000,
    years: 15,
  },
  platinum: {
    label: "Lifetime Platinum (20 years)",
    price: 8000,
    years: 20,
  },
  diamond: {
    label: "Lifetime Diamond (25 years)",
    price: 10000,
    years: 25,
  },
};

// Income brackets for selection
export const INCOME_BRACKETS = [
  { value: "greater_than_200k", label: "Greater than $200,000" },
  { value: "100k_to_200k", label: "$100,000 - $200,000" },
  { value: "50k_to_100k", label: "$50,000 - $100,000" },
  { value: "less_than_50k", label: "Less than $50,000" },
  { value: "students_unemployed", label: "Students/Unemployed" },
];

export const PAYPAL_CURRENCIES = [
  { currency: "Australian Dollar", code: "AUD" },
  // { currency: "Brazilian Real", code: "BRL" },
  { currency: "Canadian Dollar", code: "CAD" },
  // { currency: "Czech Koruna", code: "CZK" },
  // { currency: "Danish Krone", code: "DKK" },
  { currency: "Euro", code: "EUR" },
  // { currency: "Hong Kong Dollar", code: "HKD" },
  // { currency: "Hungarian Forint", code: "HUF" },
  // { currency: "Israeli New Shekel", code: "ILS" },
  // { currency: "Japanese Yen", code: "JPY" },
  // { currency: "Malaysian Ringgit", code: "MYR" },
  // { currency: "Mexican Peso", code: "MXN" },
  // { currency: "New Taiwan Dollar", code: "TWD" },
  // { currency: "New Zealand Dollar", code: "NZD" },
  // { currency: "Norwegian Krone", code: "NOK" },
  // { currency: "Philippine Peso", code: "PHP" },
  // { currency: "Polish Złoty", code: "PLN" },
  { currency: "Pound Sterling", code: "GBP" },
  // { currency: "Russian Ruble", code: "RUB" },
  // { currency: "Singapore Dollar", code: "SGD" },
  // { currency: "Swedish Krona", code: "SEK" },
  // { currency: "Swiss Franc", code: "CHF" },
  // { currency: "Thai Baht", code: "THB" },  { currency: "United States Dollar", code: "USD" },
];