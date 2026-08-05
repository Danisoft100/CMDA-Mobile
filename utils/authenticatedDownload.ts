import { File } from "expo-file-system";
import TokenManager from "~/services/TokenManager";

const getAccessToken = async () => {
  return (await TokenManager.getToken()) ?? (await TokenManager.refreshToken());
};

const isUnauthorizedDownload = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /(^|\D)401(\D|$)/.test(message);
};

const getDownloadStatus = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/(^|\D)(401|403|404)(\D|$)/);
  return match ? Number(match[2]) : null;
};

const normalizeDownloadError = (error: unknown): Error => {
  const status = getDownloadStatus(error);
  if (status === 401) return new Error("Your session has expired. Please sign in again.");
  if (status === 403) return new Error("You do not have permission to download this receipt.");
  if (status === 404) return new Error("This receipt is not available yet.");
  return error instanceof Error ? error : new Error("Receipt download failed.");
};

const assertPdf = async (file: File) => {
  const bytes = await file.bytes();
  const isPdf = bytes.length >= 5 && bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70 && bytes[4] === 45;
  if (!isPdf) {
    try {
      file.delete();
    } catch (e) { console.error('[authenticatedDownload] Failed to delete invalid PDF file:', e); }
    throw new Error("The server did not return a valid PDF receipt.");
  }
};

export const downloadAuthenticatedFile = async (
  url: string,
  destination: File
): Promise<File> => {
  let token = await getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const download = (accessToken: string) =>
    File.downloadFileAsync(url, destination, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/pdf",
      },
      idempotent: true,
    });

  try {
    await download(token);
  } catch (error) {
    if (!isUnauthorizedDownload(error)) throw normalizeDownloadError(error);

    token = await TokenManager.refreshToken();
    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    try {
      await download(token);
    } catch (retryError) {
      throw normalizeDownloadError(retryError);
    }
  }

  await assertPdf(destination);
  return destination;
};

export const safeReceiptFilename = (reference: unknown, fallback: string) => {
  const value = typeof reference === "string" && reference.trim() ? reference.trim() : fallback;
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
};
