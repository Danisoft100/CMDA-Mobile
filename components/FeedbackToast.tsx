import React from "react";
import { BaseToast, ToastConfig } from "react-native-toast-message";

// Flexible height and wrapped copy keep longer validation messages readable.
export const feedbackToastConfig: ToastConfig = Object.fromEntries(
  Object.entries({ success: "#117e45", error: "#b43c35", info: "#994279" }).map(([type, color]) => [
    type,
    (props: any) => <BaseToast {...props} text1NumberOfLines={2} text2NumberOfLines={4}
      style={{ minHeight: 68, height: "auto", width: "92%", borderLeftColor: color, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14 }}
      text1Style={{ fontSize: 14, lineHeight: 20, color: "#26332e" }}
      text2Style={{ fontSize: 13, lineHeight: 19, color: "#59665f" }} />,
  ])
);
