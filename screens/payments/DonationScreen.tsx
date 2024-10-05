import React from "react";
import { ScrollView, Text, View } from "react-native";

const DonationScreen = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
      <View>
        <Text>DonationScreen</Text>
      </View>
    </ScrollView>
  );
};

export default DonationScreen;
