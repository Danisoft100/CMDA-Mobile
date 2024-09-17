export const formatCurreny = (amount = 0, currency = "NGN") => {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  });
  return formatter.format(amount);
};
