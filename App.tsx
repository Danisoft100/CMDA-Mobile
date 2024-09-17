import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigation />
        <Toast />
      </PersistGate>
    </Provider>
  );
}
