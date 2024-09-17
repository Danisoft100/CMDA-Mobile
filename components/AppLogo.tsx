import React from "react";
import { Image } from "react-native";

type Dimension = { height?: number; width?: number };

const AppLogo = ({ height = 75, width = 100 }: Dimension) => {
  return <Image source={require("../assets/logo.png")} style={{ height, width, resizeMode: "contain" }} />;
};

export default AppLogo;
