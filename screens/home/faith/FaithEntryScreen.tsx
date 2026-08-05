import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import FaithCommentsSection from "~/components/home/FaithCommentsSection";
import NewFaithEntryModal from "~/components/home/NewFaithEntryModal";
import ReactionBar from "~/components/events/ReactionBar";
import { useCreateFaithEntryMutation, useGetAllFaithEntriesQuery } from "~/store/api/faithApi";
import { useGetCommentsQuery } from "~/store/api/commentsReactionsApi";

const CATEGORIES = ["Testimony", "Prayer", "Comment"];

const FaithEntryScreen = () => {
  const [faithEntries, setFaithEntries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const {
    data: faithEntrys,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllFaithEntriesQuery({
    page,
    limit: 10,
    category: selectedCategory === "Prayer" ? "Prayer Request" : selectedCategory,
    searchBy: searchBy || undefined,
  });
  const [createFaithEntry, { isLoading: isCreating }] = useCreateFaithEntryMutation();

  const handleSelectCategory = (category: string) => {
    setFaithEntries([]);
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSearch = (text: string) => {
    setFaithEntries([]);
    setSearchBy(text);
  };

  const handleCreate = (payload: any) => {
    createFaithEntry({ ...payload, isAnonymous: payload.isAnonymous || false })
      .unwrap()
      .then(() => {
        setFaithEntries([]);
        setSelectedCategory("");
        refetch();
        Toast.show({ type: "success", text1: `Your ${payload.category} has been submitted successfully` });
        setOpenModal(false);
      });
  };

  const toggleExpandEntry = (entryId: string) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  useEffect(() => {
    if (faithEntrys) {
      if (page === 1) {
        setFaithEntries(faithEntrys.items);
      } else {
        setFaithEntries((prev) => {
          const combinedFaiths = [...prev, ...faithEntrys.items];
          const uniqueFaiths = Array.from(new Set(combinedFaiths.map((vol) => vol._id))).map((_id) =>
            combinedFaiths.find((vol) => vol._id === _id)
          );
          return uniqueFaiths;
        });
      }
      setTotalPages(faithEntrys.meta?.totalPages);
    }
  }, [faithEntrys, page]);

  useEffect(() => {
    setPage(1);
    setFaithEntries([]);
  }, [searchBy, selectedCategory]);

  return (
    <AppContainer gap={12}>
      <SearchBar placeholder="Search faith entries..." onSearch={handleSearch} />

      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Button
          onPress={() => setOpenModal(true)}
          icon="comment-edit-outline"
          dense
          style={{ paddingHorizontal: 20 }}
        />
        <View style={{ flex: 1, flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
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
        disabled={page === totalPages}
        label={page === totalPages ? "The End" : "Load More"}
        loading={isLoading || isFetching}
        onPress={() => setPage((prev) => prev + 1)}
      />

      <NewFaithEntryModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </AppContainer>
  );
};

export default FaithEntryScreen;
