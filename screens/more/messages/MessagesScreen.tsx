import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ContactListItem from "~/components/messages/ContactListItem";
import { palette, typography } from "~/theme";

const MessagesScreen = ({ navigation }: any) => {
  return (
    <AppContainer withScrollView={false}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button onPress={() => {}} label="New Chat" dense style={{ paddingHorizontal: 20 }} />
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Search messages..." />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={{ gap: 6 }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: palette.background }}>
            <Text style={[typography.textXl, typography.fontBold]}> Recent Messages</Text>
          </View>
          <ContactListItem />
          {[...Array(20)].map((_, i) => (
            <ContactListItem
              key={i}
              name={"Test User " + (i + 1)}
              subtext="You can show the last message sent here without any hassle"
              onPress={() => navigation.navigate("more-messages-single", { id: i + 1, name: "Test User" })}
            />
          ))}
        </ScrollView>
      </View>
    </AppContainer>
  );
};

export default MessagesScreen;
