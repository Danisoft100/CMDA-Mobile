import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  SafeAreaView,
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
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
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
              <TouchableOpacity onPress={onClose}>
                <MCIcon name="close" size={28} color={palette.grey} />
              </TouchableOpacity>
            </View>

            <SearchBar placeholder="Search members..." onSearch={(v) => setSearchBy(v)} />

            {isLoading || isFetching ? (
              <View style={{ alignItems: "center", paddingTop: 64 }}>
                <ActivityIndicator style={styles.loading} color={palette.primary} />
              </View>
            ) : (
              <FlatList
                data={allUsers?.items?.filter((x: any) => x._id !== user._id)}
                renderItem={({ item }: any) => (
                  <ContactListItem
                    name={item?.fullName}
                    subtext={item.email}
                    bordered
                    onPress={() => onSelect(item)}
                    avatar={item.avatarUrl}
                  />
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    height: "75%",
    backgroundColor: palette.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  listContainer: {
    backgroundColor: palette.background,
    paddingVertical: 16,
    gap: 8,
  },
  loading: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
});

export default NewMessageModal;
