export const getApiErrorMessage = (error: unknown, fallback = "We couldn’t complete the request. Please try again."): string => {
  const value = error as any;
  const status = value?.status ?? value?.response?.status;
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR" || value?.name === "AbortError") return "We couldn’t reach CMDA. Check your connection and try again.";
  if (status === 429) return "You’ve made several requests. Please wait a minute and try again.";
  if (Number(status) >= 500) return "CMDA is temporarily unavailable. Please try again shortly.";
  const raw = typeof value === "string" ? value : value?.data?.message ?? value?.response?.data?.message ?? value?.message;
  const message = (Array.isArray(raw) ? raw : [raw]).filter(v => typeof v === "string" && v.trim()).slice(0, 3).join(". ").trim();
  if (!message || /<[^>]+>|stack|ECONN|Mongo|CastError|TypeError|Internal server|Failed to fetch|NetworkError|Unexpected token/i.test(message)) return fallback;
  return message.length > 280 ? fallback : message;
};
