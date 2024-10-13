import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography, palette } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import MessageCard from "~/components/messages/MessageCard";
import ContactListItem from "~/components/messages/ContactListItem";
import AppKeyboardAvoidingView from "~/components/AppKeyboardAvoidingView";
import { useGetSingleUserQuery } from "~/store/api/membersApi";
import { useGetChatHistoryQuery } from "~/store/api/chatsApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useSocket } from "~/utils/useSocket";

const SingleMessageScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(selectAuth);
  const scrollViewRef = useRef<ScrollView>(null);

  const [text, setText] = useState("");

  const { id, fullName } = route.params;

  const {
    data: allChatsBetweenUsers,
    isLoading,
    isFetching,
  } = useGetChatHistoryQuery(id, { refetchOnMountOrArgChange: true });

  const { data: recipientData, isLoading: loadingRecipientData } = useGetSingleUserQuery(id, {
    skip: id === "admin",
    refetchOnMountOrArgChange: true,
  });

  const [allMessages, setAllMessages] = useState<any[]>([]);

  const { socket } = useSocket();

  const handleSend = () => {
    socket?.emit("newMessage", { sender: user._id, receiver: id, content: text });
    setText("");
  };

  useEffect(() => {
    if (allChatsBetweenUsers) {
      setAllMessages(allChatsBetweenUsers);
    }
  }, [allChatsBetweenUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      setAllMessages((prev) => [...prev, newMessage]);
    };

    const eventName = `newMessage_${[user._id, id].sort().join("_")}`;

    socket.on(eventName, handleNewMessage);

    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [socket, id, user]);

  const ChatHeader = () => (
    <View style={[styles.appHeader, { paddingTop: insets.top, height: 64 + insets.top }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MCIcon name="chevron-left" size={40} color={palette.greyDark} />
      </TouchableOpacity>
      <ContactListItem name={fullName} subtext={recipientData?.email || "--"} avatar={recipientData?.avatarUrl} />
    </View>
  );

  useEffect(() => {
    navigation.setOptions({ header: ChatHeader });
  }, [navigation]);

  return (
    <AppKeyboardAvoidingView withScrollView={false}>
      <View style={styles.wrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {allMessages.map((item) => (
            <MessageCard
              key={item._id}
              type={item.sender === user._id ? "sender" : "receiver"}
              message={item.content}
              timestamp={new Date(item.updatedAt).toLocaleString("en-US", { timeStyle: "short", dateStyle: "medium" })}
            />
          ))}
        </ScrollView>

        <View style={[styles.bottom, { paddingBottom: insets.bottom - 16 }]}>
          <TextInput
            multiline
            numberOfLines={4}
            style={styles.input}
            value={text}
            onChangeText={setText}
            cursorColor={palette.primary}
            selectionColor={palette.primary}
            placeholder="Enter your message..."
            placeholderTextColor={palette.grey}
          />
          <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
            <MCIcon name="send" size={32} color={palette.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </AppKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: palette.background },
  appHeader: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    gap: 8,
  },
  avatar: { backgroundColor: palette.secondaryContainer, marginRight: 12 },
  avatarIcon: {
    backgroundColor: palette.secondaryContainer,
    height: 48,
    width: 48,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: palette.onPrimary, ...typography.textLg, ...typography.fontBold },
  subtitle: { color: palette.grey, ...typography.textBase },
  bottom: {
    backgroundColor: "white",
    padding: 16,
    paddingRight: 4,
    paddingLeft: 8,
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: palette.grey,
    borderRadius: 8,
    ...typography.textBase,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: palette.black,
  },
  messagesContainer: { flex: 1, padding: 16, gap: 12, backgroundColor: palette.onPrimary },
  content: { paddingBottom: 32 },
  iconButton: {
    backgroundColor: palette.primary,
    height: 60,
    width: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});

export default SingleMessageScreen;
