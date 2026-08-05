import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import SearchBar from "../form/SearchBar";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import ContactListItem from "./ContactListItem";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface INewMessageProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
}

const NewMessageModal = ({ visible, onClose, onSelect }: INewMessageProps) => {
  const { user } = useSelector(selectAuth);
  const [searchBy, setSearchBy] = useState("");
  const {
    data: allUsers,
    isLoading,
    isFetching,
  } = useGetAllUsersQuery({ page: 1, limit: 25, searchBy }, { refetchOnMountOrArgChange: true });

  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close new message dialog"
          style={StyleSheet.absoluteFill}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Text style={[typography.textXl, typography.fontSemiBold]}>Send a Message to</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close new message dialog">
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <SearchBar placeholder="Search members..." onSearch={setSearchBy} debounceMs={350} />

            {isLoading || isFetching ? (
              <View style={{ alignItems: "center", paddingTop: 64 }}>
                <ActivityIndicator style={styles.loading} color={palette.primary} />
              </View>
            ) : (
              <FlatList
                style={styles.list}
                data={allUsers?.items?.filter((x: any) => x._id !== user?._id)}
                renderItem={({ item }: any) => (
                  <ContactListItem
                    name={item?.fullName}
                    subtext={item.email}
                    bordered
                    onPress={() => onSelect(item)}
                    avatar={item.avatarUrl}
                    unreadCount={0}
                  />
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "75%",
    maxHeight: 640,
    backgroundColor: palette.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    backgroundColor: palette.background,
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 8,
  },
  loading: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
});

export default NewMessageModal;
