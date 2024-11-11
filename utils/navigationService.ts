import { createNavigationContainerRef, NavigationContainerRef } from "@react-navigation/native";
import { ParamListBase } from "@react-navigation/routers";

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}
