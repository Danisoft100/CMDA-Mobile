// DOB is optional. When provided, both clients retain the existing minimum age of 14.
export function getSignupBirthDateLimit(today = new Date()) {
  const year = today.getFullYear() - 14,
    month = today.getMonth();
  const cutoff = new Date(
    year,
    month,
    Math.min(today.getDate(), new Date(year, month + 1, 0).getDate()),
  );
  return [
    cutoff.getFullYear(),
    String(cutoff.getMonth() + 1).padStart(2, "0"),
    String(cutoff.getDate()).padStart(2, "0"),
  ].join("-");
}
export function validateSignupDateOfBirth(value: unknown, today = new Date()) {
  if (!value) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return "Choose a valid date of birth.";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return "Choose a valid date of birth.";
  return (
    value <= getSignupBirthDateLimit(today) ||
    "You must be at least 14 years old."
  );
}
