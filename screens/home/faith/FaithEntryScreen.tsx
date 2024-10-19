import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import NewFaithEntryModal from "~/components/home/NewFaithEntryModal";
import { useCreateFaithEntryMutation, useGetAllFaithEntriesQuery } from "~/store/api/faithApi";

const CATEGORIES = ["Testimony", "Prayer", "Comment"];

const FaithEntryScreen = () => {
  const [faithEntries, setFaithEntries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const {
    data: faithEntrys,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllFaithEntriesQuery({
    page,
    limit: 10,
    category: selectedCategory === "Prayer" ? "Prayer Request" : selectedCategory,
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

  const handleCreate = (payload: any) => {
    createFaithEntry({ ...payload, isAnonymous: false })
      .unwrap()
      .then(() => {
        setFaithEntries([]);
        setSelectedCategory("");
        refetch();
        Toast.show({ type: "success", text1: `Your ${payload.category} has been submitted successfully` });
        setOpenModal(false);
      });
  };

  useEffect(() => {
    if (faithEntrys) {
      setFaithEntries((prev) => {
        const combinedFaiths = [...prev, ...faithEntrys.items];
        const uniqueFaiths = Array.from(new Set(combinedFaiths.map((vol) => vol._id))).map((_id) =>
          combinedFaiths.find((vol) => vol._id === _id)
        );
        return uniqueFaiths;
      });

      setTotalPages(faithEntrys.meta?.totalPages);
    }
  }, [faithEntrys]);

  return (
    <AppContainer>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
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
          <FaithEntryCard
            key={faith._id}
            category={faith.category}
            user={faith.user}
            content={faith.content}
            createdAt={faith.createdAt}
          />
        ))}
      </View>

      <Button
        disabled={page === totalPages}
        label={page === totalPages ? "The End" : "Load More"}
        loading={isLoading || isFetching}
        onPress={() => setPage((prev) => prev + 1)}
      />

      {/*  */}
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
