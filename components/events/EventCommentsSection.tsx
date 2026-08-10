import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "~/store/api/commentsReactionsApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface EventCommentsSectionProps {
  eventId: string;
}

const EventCommentsSection: React.FC<EventCommentsSectionProps> = ({ eventId }) => {
  const { user } = useSelector(selectAuth);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [allComments, setAllComments] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useGetCommentsQuery(
    { parentType: "event", parentId: eventId, page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setAllComments(data.items);
      } else {
        setAllComments((prev) => [...prev, ...data.items]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setAllComments([]);
  }, [eventId]);

  const handleSend = () => {
    const text = commentText.trim();
    if (!text) return;
    createComment({ parentType: "event", parentId: eventId, content: text })
      .unwrap()
      .then(() => {
        setCommentText("");
        setPage(1);
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: err?.data?.message || "Failed to post comment" });
      });
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteComment(commentId)
            .unwrap()
            .catch((err) => {
              Toast.show({ type: "error", text1: err?.data?.message || "Failed to delete comment" });
            });
        },
      },
    ]);
  };

  const totalPages = data?.meta?.totalPages || 1;

  return (
    <View style={styles.container}>
      <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 8 }]}>Comments</Text>

      {/* Comment Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor={palette.grey}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { opacity: commentText.trim() && !isCreating ? 1 : 0.5 }]}
          onPress={handleSend}
          disabled={!commentText.trim() || isCreating}
          hitSlop={8}
        >
          <FontAwesome6 name="paper-plane" size={18} color={palette.primary} />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      {isLoading && page === 1 ? (
        <Loading marginVertical={16} />
      ) : allComments.length > 0 ? (
        <>
          {allComments.map((c: any) => {
            const isOwn = c.user?._id === user?._id || c.userId === user?._id;
            return (
              <View key={c._id} style={styles.commentRow}>
                <Image
                  source={{ uri: c.user?.profilePictureUrl || c.user?.avatar }}
                  style={styles.avatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={[typography.textSm, typography.fontSemiBold]}>
                      {c.user?.firstName
                        ? `${c.user.firstName} ${c.user.lastName || ""}`
                        : "Anonymous"}
                    </Text>
                    {isOwn && (
                      <TouchableOpacity onPress={() => handleDelete(c._id)} hitSlop={8}>
                        <FontAwesome6 name="trash-can" size={14} color={palette.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[typography.textSm, { color: palette.greyDark }]}>{c.content}</Text>
                  {c.createdAt && (
                    <Text style={[typography.textXs, { color: palette.grey, marginTop: 4 }]}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {page < totalPages && (
            <TouchableOpacity
              onPress={() => setPage((prev) => prev + 1)}
              style={styles.loadMore}
              disabled={isFetching}
            >
              <Text style={[typography.textSm, typography.fontMedium, { color: palette.primary }]}>
                {isFetching ? "Loading..." : "Load More Comments"}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={[typography.textSm, { color: palette.grey, textAlign: "center", marginVertical: 16 }]}>
          No comments yet. Be the first!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.textSm,
    color: palette.black,
    backgroundColor: palette.white,
    maxHeight: 100,
  },
  sendBtn: {
    padding: 10,
    backgroundColor: palette.onPrimary,
    borderRadius: 8,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.greyLight,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  loadMore: {
    paddingVertical: 12,
    alignItems: "center",
  },
});

export default EventCommentsSection;
