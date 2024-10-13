import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";

const NotificationScreen = () => {
  return (
    <AppContainer>
      <EmptyData title="Notifications" icon="bell" />
    </AppContainer>
  );
};

const styles = StyleSheet.create({});

export default NotificationScreen;
