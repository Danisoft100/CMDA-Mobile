export function installmentAmount(text: string, remaining: number) {
  if (!Number.isFinite(remaining) || remaining <= 0)
    return {
      error:
        "Your balance is unavailable or already fully paid. Refresh it before starting a payment.",
    };
  const value = text.trim().replace(",", ".");
  if (value && !/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(value)) {
    return {
      error: "Enter a valid amount with no more than two decimal places.",
    };
  }
  const amount = value ? Number(value) : remaining;
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Math.round(amount * 100) > Math.round(remaining * 100)
  ) {
    return {
      error:
        "Enter an amount greater than zero and no more than your remaining balance.",
    };
  }
  return { amount: Math.round(amount * 100) / 100 };
}

export function receiptAssetError(
  asset: {
    mimeType?: string;
    fileName?: string | null;
    fileSize?: number;
  } | null,
) {
  if (!asset) return "Choose a receipt image before submitting.";
  const type = asset.mimeType?.toLowerCase();
  if (
    (type && !["image/jpeg", "image/png"].includes(type)) ||
    (!type && asset.fileName && !/\.(jpe?g|png)$/i.test(asset.fileName))
  ) {
    return "Choose a JPEG or PNG image. Other image formats are not supported.";
  }
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)
    return "Choose a receipt image no larger than 5 MB.";
  return "";
}

export const zelleStatusLabel = (status: string) =>
  ({
    PENDING: "Awaiting your transfer / receipt",
    AWAITING_REVIEW: "Receipt submitted · awaiting review",
    REVIEWING: "Finance is reviewing your transfer",
    SUCCESSFUL: "Confirmed",
    FAILED: "Receipt needs attention",
  })[status] || "Status unavailable";
