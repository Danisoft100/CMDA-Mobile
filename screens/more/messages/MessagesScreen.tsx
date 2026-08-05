import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import Loading from "~/components/Loading";
import ContactListItem from "~/components/messages/ContactListItem";
import NewMessageModal from "~/components/messages/NewMessageModal";
import { useGetAllContactsQuery } from "~/store/api/chatsApi";

type MessageContact = {
  key: string;
  id: string;
  name: string;
  avatar?: string;
  subtext: string;
  unreadCount?: number;
};

const MessagesScreen = ({ navigation }: any) => {
  const {
    data: { contacts: allContacts, adminUnreadCount, adminLastMessage } = { contacts: [] },
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllContactsQuery(null, { refetchOnMountOrArgChange: true });
  const [openNewMsg, setOpenNewMsg] = useState(false);
  const [search, setSearch] = useState("");

  const contacts = useMemo<MessageContact[]>(() => {
    const items: MessageContact[] = [
      {
        key: "admin",
        id: "admin",
        name: "Admin",
        subtext: adminLastMessage || "No messages yet",
        unreadCount: adminUnreadCount,
      },
      ...(allContacts || [])
        .filter((contact: any) => contact.chatWith?._id)
        .map((contact: any) => ({
          key: contact.chatWith._id,
          id: contact.chatWith._id,
          name: contact.chatWith.fullName || "CMDA member",
          avatar: contact.chatWith.avatarUrl,
          subtext: contact.lastMessage || "No messages yet",
          unreadCount: contact.unreadCount,
        })),
    ];
    const query = search.trim().toLowerCase();
    return query
      ? items.filter((item) => `${item.name} ${item.subtext}`.toLowerCase().includes(query))
      : items;
  }, [adminLastMessage, adminUnreadCount, allContacts, search]);

  return (
    <AppContainer withScrollView={false}>
      <View style={styles.toolbar}>
        <Button
          onPress={() => setOpenNewMsg(true)}
          icon="message-plus-outline"
          dense
          style={styles.newMessageButton}
        />
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Search messages" onSearch={setSearch} />
        </View>
      </View>

      {isLoading ? (
        <Loading center marginVertical={48} />
      ) : isError ? (
        <View style={styles.feedback}>
          <EmptyData
            title="Messages unavailable"
            subtitle="We couldn't load your conversations. Check your connection and try again."
            icon="message-alert-outline"
          />
          <Button label="Try Again" onPress={refetch} />
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <ContactListItem
              name={item.name}
              avatar={item.avatar}
              subtext={item.subtext}
              onPress={() =>
                navigation.navigate("home-messages-single", {
                  id: item.id,
                  fullName: item.name,
                })
              }
              bordered
              unreadCount={item.unreadCount}
            />
          )}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={contacts.length ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <EmptyData
              title="No matching messages"
              subtitle="Try a different name or message text."
              icon="message-search-outline"
            />
          }
        />
      )}

      <NewMessageModal
        visible={openNewMsg}
        onClose={() => setOpenNewMsg(false)}
        onSelect={(item) => {
          setOpenNewMsg(false);
          navigation.navigate("home-messages-single", { id: item?._id, fullName: item?.fullName });
        }}
      />
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", gap: 12, alignItems: "center" },
  newMessageButton: { minHeight: 48, minWidth: 48 },
  list: { paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  feedback: { gap: 16 },
});

export default MessagesScreen;
