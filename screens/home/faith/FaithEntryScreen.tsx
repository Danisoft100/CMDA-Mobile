import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import FaithEntryCard from "~/components/home/FaithEntryCard";
import { useCreateFaithEntryMutation, useGetAllFaithEntriesQuery } from "~/store/api/faithApi";
import { palette, typography } from "~/theme";

const FaithEntryScreen = () => {
  const [faithEntries, setFaithEntries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const { data: faithEntrys, isLoading, isFetching } = useGetAllFaithEntriesQuery({ page, limit: 10, searchBy });
  const [openModal, setOpenModal] = useState(false);
  const [createFaithEntry, { isLoading: isCreating }] = useCreateFaithEntryMutation();

  const handleCreate = (payload: any) => {
    createFaithEntry({ ...payload, isAnonymous: false })
      .unwrap()
      .then(() => {
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
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button
          onPress={() => setOpenModal(true)}
          icon="comment-edit-outline"
          dense
          style={{ paddingHorizontal: 20 }}
        />
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search messages..."
            onSearch={(v) => {
              setFaithEntries([]);
              setSearchBy(v);
            }}
          />
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
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...typography.textSm,
    ...typography.fontSemiBold,
    borderRadius: 12,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  label: { ...typography.textSm, color: palette.grey },
  value: { ...typography.textSm, ...typography.fontMedium, color: palette.black },
});

export default FaithEntryScreen;
