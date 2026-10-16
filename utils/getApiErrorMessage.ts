export const getApiErrorMessage = (error: unknown, fallback = "Please try again."): string => {
  const value = error as any;
  const message = typeof value === "string" ? value : value?.data?.message ?? value?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join(", ") || fallback;
  return typeof message === "string" && message.trim() ? message : fallback;
};
