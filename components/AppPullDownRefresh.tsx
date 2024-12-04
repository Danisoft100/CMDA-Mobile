import React, { useState } from "react";
import { RefreshControl } from "react-native";
import { palette } from "~/theme";

const AppPullDownRefresh = ({ onRefreshData }: { onRefreshData: () => void }) => {
  // Pull down to refresh
  const [refreshing, setRefreshing] = useState(false);

  // Simulate data refreshing
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (onRefreshData) onRefreshData();
    }, 2000); // Simulate a network request
  };

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={palette.primary}
      progressBackgroundColor={palette.primary}
    />
  );
};

export default AppPullDownRefresh;
