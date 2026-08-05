import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import EmptyData from "~/components/EmptyData";
import {
  useGetEventFeedbackQuery,
  useSubmitEventFeedbackMutation,
} from "~/store/api/commentsReactionsApi";
import { palette, typography } from "~/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const StarRating = ({ rating, onRate, size = 32 }: { rating: number; onRate?: (r: number) => void; size?: number }) => {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate?.(star)}
          disabled={!onRate}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <FontAwesome6
            name={star <= rating ? "star" : "star"}
            size={size}
            color={star <= rating ? "#F39C12" : palette.greyLight}
            solid={star <= rating}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const EventFeedbackScreen = ({ route }: any) => {
  const { eventId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useGetEventFeedbackQuery(
    { eventId, page, limit: 10 },
    { refetchOnMountOrArgChange: true }
  );

  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitEventFeedbackMutation();

  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setAllFeedback(data.items);
      } else {
        setAllFeedback((prev) => [...prev, ...data.items]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setAllFeedback([]);
  }, [eventId]);

  const handleSubmit = () => {
    if (rating === 0) {
      Toast.show({ type: "error", text1: "Please select a rating" });
      return;
    }
    submitFeedback({ eventId, rating, comment: comment.trim() || undefined })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Feedback submitted!" });
        setRating(0);
        setComment("");
        setPage(1);
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: err?.data?.message || "Failed to submit feedback" });
      });
  };

  const totalPages = data?.meta?.totalPages || 1;
  const averageRating = data?.meta?.averageRating;

  return (
    <AppContainer gap={16}>
      <Text style={[typography.textXl, typography.fontBold]}>Event Feedback</Text>

      {/* Average Rating */}
      {averageRating != null && (
        <View style={styles.avgCard}>
          <Text style={[typography.text3xl, typography.fontBold, { color: palette.primary }]}>
            {Number(averageRating).toFixed(1)}
          </Text>
          <StarRating rating={Math.round(averageRating)} size={20} />
          <Text style={[typography.textSm, { color: palette.grey }]}>
            Based on {data?.meta?.total || 0} reviews
          </Text>
        </View>
      )}

      {/* Submit Feedback */}
      <View style={styles.formCard}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 8 }]}>
          Rate This Event
        </Text>
        <StarRating rating={rating} onRate={setRating} />
        <TextInput
          style={styles.textArea}
          placeholder="Leave a comment (optional)..."
          placeholderTextColor={palette.grey}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Button
          label="Submit Feedback"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={rating === 0}
        />
      </View>

      {/* Existing Feedback */}
      <Text style={[typography.textLg, typography.fontSemiBold]}>All Feedback</Text>
      {isLoading && page === 1 ? (
        <Loading marginVertical={32} />
      ) : allFeedback.length > 0 ? (
        <>
          {allFeedback.map((item: any) => (
            <View key={item._id} style={styles.feedbackRow}>
              <View style={styles.feedbackHeader}>
                <Text style={[typography.textSm, typography.fontMedium]}>
                  {item.user?.firstName
                    ? `${item.user.firstName} ${item.user.lastName || ""}`
                    : "Anonymous"}
                </Text>
                <StarRating rating={item.rating} size={14} />
              </View>
              {item.comment ? (
                <Text style={[typography.textSm, { color: palette.greyDark, marginTop: 4 }]}>
                  {item.comment}
                </Text>
              ) : null}
              {item.createdAt && (
                <Text style={[typography.textXs, { color: palette.grey, marginTop: 4 }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}

          <Button
            disabled={page === totalPages}
            label={page === totalPages ? "The End" : "Load More"}
            loading={isFetching && page > 1}
            onPress={() => setPage((prev) => prev + 1)}
          />
        </>
      ) : (
        <EmptyData title="No Feedback" subtitle="Be the first to leave feedback!" icon="message-text" />
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  avgCard: {
    alignItems: "center",
    gap: 8,
    padding: 20,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  formCard: {
    padding: 16,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.greyLight,
    gap: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    ...typography.textSm,
    color: palette.black,
    backgroundColor: palette.background,
  },
  feedbackRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default EventFeedbackScreen;
