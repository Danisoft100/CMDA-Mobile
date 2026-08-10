import { createNavigationContainerRef, ParamListBase } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<ParamListBase>();
let pendingNavigation: { name: string; params?: object; reset?: boolean } | null = null;

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  } else {
    pendingNavigation = { name, params };
  }
}

export function resetTo(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({ index: 0, routes: [{ name, params }] });
  } else {
    pendingNavigation = { name, params, reset: true };
  }
}

export function flushPendingNavigation() {
  if (!pendingNavigation || !navigationRef.isReady()) return;
  const { name, params, reset } = pendingNavigation;
  pendingNavigation = null;
  if (reset) {
    navigationRef.resetRoot({ index: 0, routes: [{ name, params }] });
  } else {
    navigationRef.navigate(name as any, params as any);
  }
}
