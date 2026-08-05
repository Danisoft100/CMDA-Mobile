import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import { useGetCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from "~/store/api/commentsReactionsApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatDate } from "~/utils/dateFormatter";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import Toast from "react-native-toast-message";

interface FaithCommentsSectionProps {
  faithEntryId: string;
}

const FaithCommentsSection = ({ faithEntryId }: FaithCommentsSectionProps) => {
  const { user } = useSelector(selectAuth);
  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: commentsData, isLoading } = useGetCommentsQuery({
    parentType: "faith_entry",
    parentId: faithEntryId,
    page: 1,
    limit: 50,
  });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const comments = commentsData?.items || commentsData || [];

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Toast.show({ type: "info", text1: "Please enter a comment" });
      return;
    }

    try {
      await createComment({
        parentType: "faith_entry",
        parentId: faithEntryId,
        content: commentText.trim(),
        isAnonymous,
      }).unwrap();
      setCommentText("");
      Toast.show({ type: "success", text1: "Comment added" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error?.data?.message || "Failed to add comment" });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComment(commentId).unwrap();
            Toast.show({ type: "success", text1: "Comment deleted" });
          } catch (error: any) {
            Toast.show({ type: "error", text1: error?.data?.message || "Failed to delete comment" });
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.textBase, typography.fontSemiBold, styles.title]}>
        Comments {comments.length > 0 ? `(${comments.length})` : ""}
      </Text>

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={palette.grey}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[styles.anonymousToggle, isAnonymous && styles.anonymousToggleActive]}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <MCIcon
              name={isAnonymous ? "eye-off" : "eye"}
              size={14}
              color={isAnonymous ? palette.primary : palette.grey}
            />
            <Text style={[styles.anonymousText, isAnonymous && styles.anonymousTextActive]}>
              Anonymous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={isCreating || !commentText.trim()}
          >
            {isCreating ? (
              <Loading center marginVertical={0} size={16} />
            ) : (
              <MCIcon name="send" size={18} color={commentText.trim() ? palette.white : palette.grey} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <Loading center marginVertical={24} />
      ) : comments.length > 0 ? (
        comments.map((comment: any) => {
          const isOwner = String(comment.user?._id || comment.user) === String(user?._id);
          const commentUser = comment.user || {};

          return (
            <View key={comment._id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthor}>
                  {commentUser.avatarUrl ? (
                    <View style={styles.avatarSmall}>
                      <MCIcon name="account" size={16} color={palette.primary} />
                    </View>
                  ) : (
                    <View style={[styles.avatarSmall, { backgroundColor: palette.onPrimary }]}>
                      <MCIcon name="account" size={16} color={palette.primary} />
                    </View>
                  )}
                  <Text style={[typography.textSm, typography.fontSemiBold]}>
                    {comment.isAnonymous ? "Anonymous" : commentUser.fullName || "User"}
                  </Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={[typography.textXs, { color: palette.grey }]}>
                    {formatDate(comment.createdAt).date}
                  </Text>
                  {isOwner && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment._id)} hitSlop={8}>
                      <MCIcon name="delete-outline" size={16} color={palette.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={[typography.textSm, styles.commentContent]}>{comment.content}</Text>
            </View>
          );
        })
      ) : (
        <Text style={[typography.textSm, { color: palette.grey, textAlign: "center", paddingVertical: 16 }]}>
          No comments yet. Be the first to comment!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    color: palette.greyDark,
  },
  inputContainer: {
    backgroundColor: palette.background,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  input: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
    minHeight: 40,
    maxHeight: 100,
    padding: 0,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: palette.white,
  },
  anonymousToggleActive: {
    backgroundColor: palette.primary + "15",
  },
  anonymousText: {
    ...typography.textXs,
    ...typography.fontMedium,
    color: palette.grey,
  },
  anonymousTextActive: {
    color: palette.primary,
  },
  sendButton: {
    backgroundColor: palette.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: palette.greyLight,
  },
  commentCard: {
    backgroundColor: palette.white,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.greyLight,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentContent: {
    ...typography.fontMedium,
    color: palette.black,
    lineHeight: 20,
  },
});

export default FaithCommentsSection;
