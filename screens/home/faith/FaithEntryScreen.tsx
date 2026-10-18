import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import FaithCommentsSection from "~/components/home/FaithCommentsSection";
import NewFaithEntryModal from "~/components/home/NewFaithEntryModal";
import ReactionBar from "~/components/events/ReactionBar";
import {
  useCreateFaithEntryMutation,
  useGetAllFaithEntriesQuery,
} from "~/store/api/faithApi";
import QueryFeedback from "~/components/QueryFeedback";
import { usePagedResults } from "~/utils/usePagedResults";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";

const CATEGORIES = ["Testimony", "Prayer", "Comment"];

const FaithEntryScreen = () => {
  const [page, setPage] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const {
    currentData: faithEntrys,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllFaithEntriesQuery({
    page,
    limit: 10,
    category:
      selectedCategory === "Prayer" ? "Prayer Request" : selectedCategory,
    searchBy: searchBy || undefined,
    feedbackHandled: true,
  });
  const resultKey = JSON.stringify([selectedCategory, searchBy]);
  const { items: faithEntries, totalPages } = usePagedResults(
    faithEntrys,
    page,
    resultKey,
  );
  const [createFaithEntry, { isLoading: isCreating }] =
    useCreateFaithEntryMutation();

  const handleSelectCategory = (category: string) => {
    setPage(1);
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSearch = (text: string) => {
    setPage(1);
    setSearchBy(text);
  };

  const handleCreate = (payload: any) => {
    if (isCreating) return;
    setSubmitError("");
    createFaithEntry({ ...payload, isAnonymous: payload.isAnonymous || false })
      .unwrap()
      .then(() => {
        setPage(1);
        setSelectedCategory("");
        refetch();
        Toast.show({
          type: "success",
          text1: `Your ${payload.category} has been submitted successfully`,
        });
        setOpenModal(false);
      })
      .catch((error) =>
        setSubmitError(
          getApiErrorMessage(
            error,
            "Your entry could not be submitted. Please try again.",
          ),
        ),
      );
  };

  const toggleExpandEntry = (entryId: string) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  return (
    <AppContainer gap={12}>
      <SearchBar
        placeholder="Search faith entries..."
        onSearch={handleSearch}
      />

      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Button
          onPress={() => setOpenModal(true)}
          icon="comment-edit-outline"
          dense
          style={{ paddingHorizontal: 20 }}
        />
        <View
          style={{ flex: 1, flexDirection: "row", gap: 4, flexWrap: "wrap" }}
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              dense
              label={cat}
              variant={selectedCategory === cat ? "filled" : "outlined"}
              onPress={() => handleSelectCategory(cat)}
            />
          ))}
        </View>
      </View>

      <View>
        <QueryFeedback
          loading={isFetching && !faithEntries.length}
          error={isError ? error : undefined}
          empty={!isFetching && !isError && !faithEntries.length}
          onRetry={refetch}
          label="faith entries"
        />
        {faithEntries.map((faith) => (
          <TouchableOpacity
            key={faith._id}
            activeOpacity={0.9}
            onPress={() => toggleExpandEntry(faith._id)}
          >
            <FaithEntryCard
              category={faith.category}
              user={faith.user}
              isAnonymous={faith.isAnonymous}
              content={faith.content}
              createdAt={faith.createdAt}
              commentCount={faith.commentCount}
            >
              <ReactionBar
                parentType="faith_entry"
                parentId={faith._id}
                onCommentPress={() => toggleExpandEntry(faith._id)}
                commentCount={faith.commentCount}
              />
            </FaithEntryCard>
            {expandedEntryId === faith._id && (
              <FaithCommentsSection faithEntryId={faith._id} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        disabled={page >= totalPages || isError}
        label={page >= totalPages ? "The End" : "Load More"}
        loading={isLoading || isFetching}
        onPress={() => setPage((prev) => prev + 1)}
      />

      <NewFaithEntryModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
        error={submitError}
      />
    </AppContainer>
  );
};

export default FaithEntryScreen;
