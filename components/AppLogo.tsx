import React from "react";
import { Image } from "react-native";

type Dimension = { height?: number; width?: number };

const AppLogo = ({ height = 120 }: Dimension) => {
  return <Image source={require("../assets/logo.png")} style={{ height, resizeMode: "contain" }} />;
};

export default AppLogo;
