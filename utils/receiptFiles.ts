import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import {
  EncodingType,
  StorageAccessFramework,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const RECEIPT_DIRECTORY_KEY = "cmda_receipt_directory_uri";

export type ReceiptSaveResult =
  | { status: "saved"; uri: string }
  | { status: "shared"; uri: string }
  | { status: "cancelled" };

const chooseReceiptDirectory = async () => {
  const previousDirectory = await AsyncStorage.getItem(RECEIPT_DIRECTORY_KEY);
  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync(
    previousDirectory || StorageAccessFramework.getUriForDirectoryInRoot("Download")
  );

  if (!permission.granted) return null;
  await AsyncStorage.setItem(RECEIPT_DIRECTORY_KEY, permission.directoryUri);
  return permission.directoryUri;
};

export const saveReceiptPdf = async (
  file: File,
  filename: string,
  dialogTitle: string
): Promise<ReceiptSaveResult> => {
  if (Platform.OS === "android") {
    const directoryUri = await chooseReceiptDirectory();
    if (!directoryUri) return { status: "cancelled" };

    try {
      const targetUri = await StorageAccessFramework.createFileAsync(
        directoryUri,
        filename.replace(/\.pdf$/i, ""),
        "application/pdf"
      );
      await StorageAccessFramework.writeAsStringAsync(targetUri, await file.base64(), {
        encoding: EncodingType.Base64,
      });
      return { status: "saved", uri: targetUri };
    } catch (error) {
      await AsyncStorage.removeItem(RECEIPT_DIRECTORY_KEY);
      throw error;
    }
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Saving files is not supported on this device.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle,
    UTI: "com.adobe.pdf",
  });
  return { status: "shared", uri: file.uri };
};

export const shareReceiptPdf = async (file: File, dialogTitle: string) => {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle,
    UTI: "com.adobe.pdf",
  });
  return true;
};
