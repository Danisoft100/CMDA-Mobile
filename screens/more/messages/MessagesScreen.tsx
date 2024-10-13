import React from "react";
import { ScrollView, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ContactListItem from "~/components/messages/ContactListItem";
import { useGetAllContactsQuery } from "~/store/api/chatsApi";

const MessagesScreen = ({ navigation }: any) => {
  const { data: allContacts, isLoading: loadingChats } = useGetAllContactsQuery(null, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <AppContainer withScrollView={false}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button onPress={() => {}} label="New Chat" dense style={{ paddingHorizontal: 20 }} />
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Search messages..." />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: 6 }} showsVerticalScrollIndicator={false}>
          <ContactListItem
            onPress={() => navigation.navigate("home-messages-single", { id: "admin", fullName: "Admin" })}
          />
          {allContacts?.map((contact: any) => (
            <ContactListItem
              key={contact._id}
              name={contact.chatWith?.fullName}
              avatar={contact.chatWith?.avatarUrl}
              subtext={contact.lastMessage}
              onPress={() =>
                navigation.navigate("home-messages-single", {
                  id: contact.chatWith?._id,
                  fullName: contact.chatWith?.fullName,
                })
              }
            />
          ))}
        </ScrollView>
      </View>
    </AppContainer>
  );
};

export default MessagesScreen;
