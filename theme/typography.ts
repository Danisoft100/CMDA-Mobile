import { Platform } from "react-native";

export const typography: Typography = {
  textXs: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Raleway_400Regular",
  },
  textSm: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Raleway_400Regular",
  },
  textBase: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Raleway_400Regular",
  },
  textLg: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Raleway_400Regular",
  },
  textXl: {
    fontSize: 20,
    lineHeight: 32,
    fontFamily: "Raleway_400Regular",
  },
  text2xl: {
    fontSize: 24,
    lineHeight: 36,
    fontFamily: "Raleway_400Regular",
  },
  text3xl: {
    fontSize: 30,
    lineHeight: 40,
    fontFamily: "Raleway_400Regular",
  },
  text4xl: {
    fontSize: 36,
    lineHeight: 48,
    fontFamily: "Raleway_400Regular",
  },
  text5xl: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: "Raleway_400Regular",
  },

  /*
    ======== Font Weights ========
  */
  fontLight: {
    fontWeight: "300",
    fontFamily: "Raleway_300Light",
  },
  fontNormal: {
    fontWeight: "400",
    fontFamily: "Raleway_400Regular",
  },
  fontMedium: {
    fontWeight: "500",
    fontFamily: "Raleway_500Medium",
  },
  fontSemiBold: {
    fontWeight: "600",
    fontFamily: "Raleway_600SemiBold",
  },
  fontBold: {
    fontWeight: Platform.OS === "android" ? "600" : "700",
    fontFamily: Platform.OS === "android" ? "Raleway_600SemiBold" : "Raleway_700Bold",
  },
};

export interface TypographyItem {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
}

export interface Typography {
  textXs: TypographyItem;
  textSm: TypographyItem;
  textBase: TypographyItem;
  textLg: TypographyItem;
  textXl: TypographyItem;
  text2xl: TypographyItem;
  text3xl: TypographyItem;
  text4xl: TypographyItem;
  text5xl: TypographyItem;
  fontLight: {
    fontWeight: "300";
    fontFamily: string;
  };
  fontNormal: {
    fontWeight: "400";
    fontFamily: string;
  };
  fontMedium: {
    fontWeight: "500";
    fontFamily: string;
  };
  fontSemiBold: {
    fontWeight: "600";
    fontFamily: string;
  };
  fontBold: {
    fontWeight: "600" | "700";
    fontFamily: string;
  };
}
