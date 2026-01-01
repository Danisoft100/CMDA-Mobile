export const formatCurrency = (amount = 0, currency = "NGN") => {
  const locale = currency === "USD" ? "en-US" : "en-NG";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  return formatter.format(amount);
};
