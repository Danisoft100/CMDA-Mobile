import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";
import { useToggleReactionMutation, useGetReactionsQuery } from "~/store/api/commentsReactionsApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";

const REACTION_TYPES = [
  { type: "like", icon: "thumb-up", label: "Like" },
  { type: "love", icon: "heart", label: "Love" },
  { type: "pray", icon: "hands-pray", label: "Pray" },
  { type: "amen", icon: "hand-heart", label: "Amen" },
];

interface ReactionBarProps {
  parentType: string;
  parentId: string;
  onCommentPress?: () => void;
  commentCount?: number;
}

const ReactionBar = ({ parentType, parentId, onCommentPress, commentCount }: ReactionBarProps) => {
  const { user } = useSelector(selectAuth);
  const { data: reactionsData } = useGetReactionsQuery({ parentType, parentId });
  const [toggleReaction] = useToggleReactionMutation();

  const reactions = reactionsData || [];
  const userReaction = reactions.find((r: any) => String(r.user?._id || r.user) === String(user?._id));

  const handleReaction = async (type: string) => {
    try {
      await toggleReaction({ parentType, parentId, type }).unwrap();
    } catch (error) {
      // Ignore
    }
  };

  const getReactionCount = (type: string) => {
    return reactions.filter((r: any) => r.type === type).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.reactionsRow}>
        {REACTION_TYPES.map((reaction) => {
          const count = getReactionCount(reaction.type);
          const isActive = userReaction?.type === reaction.type;

          return (
            <TouchableOpacity
              key={reaction.type}
              style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
              onPress={() => handleReaction(reaction.type)}
            >
              <MCIcon
                name={reaction.icon as any}
                size={16}
                color={isActive ? palette.primary : palette.grey}
              />
              {count > 0 && (
                <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {onCommentPress && (
        <TouchableOpacity style={styles.commentButton} onPress={onCommentPress}>
          <MCIcon name="comment-outline" size={16} color={palette.grey} />
          {commentCount !== undefined && commentCount > 0 && (
            <Text style={styles.commentCount}>{commentCount}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.greyLight,
    marginTop: 8,
  },
  reactionsRow: {
    flexDirection: "row",
    gap: 4,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: palette.background,
  },
  reactionButtonActive: {
    backgroundColor: palette.primary + "15",
  },
  reactionCount: {
    ...typography.textXs,
    ...typography.fontMedium,
    color: palette.grey,
  },
  reactionCountActive: {
    color: palette.primary,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: palette.background,
  },
  commentCount: {
    ...typography.textXs,
    ...typography.fontMedium,
    color: palette.grey,
  },
});

export default ReactionBar;
