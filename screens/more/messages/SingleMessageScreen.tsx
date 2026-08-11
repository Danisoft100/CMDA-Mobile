import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { typography, palette } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import MessageCard from "~/components/messages/MessageCard";
import ContactListItem from "~/components/messages/ContactListItem";
import { useGetSingleUserQuery } from "~/store/api/membersApi";
import { useBlockUserMutation, useGetChatHistoryQuery, useReportMessageMutation, useSendMessageMutation } from "~/store/api/chatsApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useSocket } from "~/utils/useSocket";
import * as Crypto from "expo-crypto";

const PAGE_SIZE = 50;

const SingleMessageScreen = ({ navigation, route }: any) => {
  const { user } = useSelector(selectAuth);
  const listRef = useRef<FlatList<any>>(null);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const { id, fullName } = route.params;
  const { socket, state: socketState } = useSocket();

  const { data: chatData, isLoading, isFetching, error, refetch } = useGetChatHistoryQuery(
    { id, page, limit: PAGE_SIZE },
    {
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      // REST polling keeps conversations current if the real-time socket is temporarily unavailable.
      pollingInterval: socketState.connected ? 0 : 10000,
    }
  );
  const { data: recipientData } = useGetSingleUserQuery(id, {
    skip: id === "admin",
    refetchOnMountOrArgChange: true,
  });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [reportMessage] = useReportMessageMutation();

  useEffect(() => {
    setPage(1);
    setAllMessages([]);
  }, [id]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !user?._id) return;

    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user._id,
      receiver: id,
      content,
      createdAt: new Date().toISOString(),
    };
    setAllMessages((current) => [...current, optimistic]);
    setText("");

    try {
      const savedMessage = await sendMessage({
        receiver: id,
        content,
        clientMessageId: Crypto.randomUUID(),
      }).unwrap();
      setAllMessages((current) => {
        const withoutTemp = current.filter((message) => message._id !== tempId);
        if (!savedMessage?._id || withoutTemp.some((message) => message._id === savedMessage._id)) {
          return withoutTemp;
        }
        return [...withoutTemp, savedMessage];
      });
    } catch {
      setAllMessages((current) => current.filter((message) => message._id !== tempId));
      setText(content);
      Toast.show({
        type: "error",
        text1: "Message not sent",
        text2: "Please check your connection and try again.",
      });
    }
  };

  useEffect(() => {
    const incomingMessages = chatData?.messages || [];
    if (!incomingMessages.length && page === 1) {
      setAllMessages([]);
      return;
    }
    if (!incomingMessages.length) return;

    setAllMessages((current) => {
      const combined = page === 1 ? incomingMessages : [...incomingMessages, ...current];
      const uniqueMessages = new Map(combined.map((message: any) => [message._id, message]));
      return Array.from(uniqueMessages.values());
    });
  }, [chatData?.messages, page]);

  useEffect(() => {
    if (!socket || !user?._id) return;
    const eventName = `newMessage_${[user._id, id].sort().join("_")}`;
    const handleNewMessage = (newMessage: any) => {
      setAllMessages((current) => {
        const withoutTemp = current.filter(
          (m) => !(String(m._id).startsWith("temp_") && m.content === newMessage.content && m.sender === newMessage.sender)
        );
        if (withoutTemp.some((message) => message._id === newMessage._id)) return withoutTemp;
        return [...withoutTemp, newMessage];
      });
    };

    socket.on(eventName, handleNewMessage);
    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [socket, id, user?._id]);

  useEffect(() => {
    if (!socket) return;
    const recover = () => {
      if (page !== 1) setPage(1);
      else refetch();
    };
    socket.on("connect", recover);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") recover();
    });
    return () => {
      socket.off("connect", recover);
      subscription.remove();
    };
  }, [socket, page, refetch]);

  const confirmBlock = () => {
    if (id === "admin" || isBlocking) return;
    Alert.alert(
      `Block ${fullName}?`,
      "Neither of you will be able to send messages in this conversation.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await blockUser(id).unwrap();
              Toast.show({ type: "success", text1: "Member blocked" });
              navigation.goBack();
            } catch (blockError: any) {
              Toast.show({
                type: "error",
                text1: "Could not block member",
                text2: blockError?.data?.message || "Please try again.",
              });
            }
          },
        },
      ],
    );
  };

  const confirmReport = (message: any) => {
    if (!message?._id || String(message._id).startsWith("temp_") || message.sender === user?._id) return;
    Alert.alert("Report this message?", "CMDA administrators will review it.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: async () => {
          try {
            await reportMessage({
              messageId: message._id,
              reason: "Member reported this message as inappropriate or abusive",
            }).unwrap();
            Toast.show({ type: "success", text1: "Message reported" });
          } catch (reportError: any) {
            Toast.show({
              type: "error",
              text1: "Could not report message",
              text2: reportError?.data?.message || "Please try again.",
            });
          }
        },
      },
    ]);
  };

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <SafeAreaView edges={["top"]} style={styles.appHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MCIcon name="chevron-left" size={40} color={palette.greyDark} />
          </TouchableOpacity>
          <ContactListItem
            name={fullName}
            subtext={id === "admin" ? "CMDA Nigeria" : recipientData?.membershipId || "CMDA Member"}
            avatar={recipientData?.avatarUrl}
            unreadCount={0}
          />
          {id !== "admin" ? (
            <TouchableOpacity style={styles.headerAction} onPress={confirmBlock} disabled={isBlocking}>
              {isBlocking ? (
                <ActivityIndicator size="small" color={palette.error} />
              ) : (
                <MCIcon name="account-cancel-outline" size={25} color={palette.error} />
              )}
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      ),
    });
  }, [fullName, id, navigation, recipientData?.avatarUrl, recipientData?.membershipId, isBlocking]);

  const hasMore = !!chatData?.pagination?.hasMore;
  const cannotSend = !text.trim() || !user?._id || isSending;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={allMessages}
          keyExtractor={(item) => String(item._id)}
          style={styles.messagesContainer}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (page === 1) listRef.current?.scrollToEnd({ animated: true });
          }}
          ListHeaderComponent={
            <>
              {hasMore ? (
                <TouchableOpacity style={styles.loadMoreButton} onPress={() => setPage((value) => value + 1)} disabled={isFetching}>
                  {isFetching ? <ActivityIndicator color={palette.primary} /> : <Text style={styles.loadMoreText}>Load older messages</Text>}
                </TouchableOpacity>
              ) : null}
              {isLoading ? <ActivityIndicator style={styles.loading} size="large" color={palette.primary} /> : null}
              {error && !allMessages.length ? (
                <View style={styles.loadError}>
                  <Text style={styles.errorText}>Messages could not be loaded.</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          }
          renderItem={({ item }) => (
            <MessageCard
              type={String(item.sender) === String(user?._id) ? "sender" : "receiver"}
              message={item.content}
              onLongPress={() => confirmReport(item)}
              timestamp={new Date(item.createdAt || item.updatedAt).toLocaleString("en-US", {
                timeStyle: "short",
                dateStyle: "medium",
              })}
            />
          )}
        />

        <View style={styles.inputArea}>
          <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
            <View style={styles.bottom}>
            <TextInput
              multiline
              numberOfLines={1}
              style={styles.input}
              value={text}
              onChangeText={setText}
              cursorColor={palette.primary}
              selectionColor={palette.primary}
              placeholder="Type a message..."
              placeholderTextColor={palette.grey}
            />
            <TouchableOpacity
              style={[styles.iconButton, cannotSend && styles.disabledButton]}
              onPress={handleSend}
              disabled={cannotSend}
            >
              <MCIcon name="send" size={24} color={palette.onPrimary} />
            </TouchableOpacity>
          </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    gap: 4,
    paddingBottom: 8,
  },
  headerAction: { marginLeft: "auto", paddingHorizontal: 16, paddingVertical: 10 },
  messagesContainer: { flex: 1, padding: 16, backgroundColor: palette.onPrimary },
  content: { paddingBottom: 16, gap: 12, flexGrow: 1 },
  loading: { marginVertical: 40 },
  loadError: { alignItems: "center", gap: 10, marginVertical: 24 },
  errorText: { ...typography.textBase, color: palette.error, textAlign: "center" },
  retryButton: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18, backgroundColor: palette.primary },
  retryText: { ...typography.textSm, ...typography.fontSemiBold, color: palette.white },
  loadMoreButton: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8 },
  loadMoreText: { ...typography.textSm, ...typography.fontSemiBold, color: palette.primary },
  inputArea: {
    backgroundColor: palette.white,
  },
  bottomSafe: {
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
  },
  bottom: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 22,
    ...typography.textBase,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: palette.black,
    backgroundColor: palette.background,
  },
  iconButton: {
    backgroundColor: palette.primary,
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: { opacity: 0.4 },
});

export default SingleMessageScreen;
