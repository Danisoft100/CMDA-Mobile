import { configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "./extras/rootReducer";
import rootMiddleWare from "./extras/rootMiddleware";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Add error handling for storage issues
  writeFailHandler: (err: any) => {
    console.error('[Store] Persist write failed:', err);
  },
  // Add timeout for storage operations
  timeout: 10000,
};

let persistedReducer: any;
try {
  persistedReducer = persistReducer(persistConfig, rootReducer);
} catch (error) {
  console.error('[Store] Failed to create persisted reducer:', error);
  // Fallback to non-persisted reducer
  persistedReducer = rootReducer;
}

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable these checks in development to avoid performance warnings
      // They are already disabled in production builds
      immutableCheck: false,
      serializableCheck: false,
    }).concat(rootMiddleWare) as any,
  devTools: __DEV__,
});

export const persistor = persistStore(store, null, () => {
  console.log('[Store] Persistence initialization complete');
});

// Add error handling for persistor
persistor.subscribe(() => {
  try {
    const state = persistor.getState() as any;
    if (state.err) {
      console.error('[Store] Persistor error:', state.err);
    }
  } catch (error) {
    console.error('[Store] Error checking persistor state:', error);
  }
});

export default store;
