import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import MemberCard from "~/components/member/MemberCard";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import { typography } from "~/theme";

const MembersScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: any) => state.auth);

  const [members, setMembers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const [role, setRole] = useState(null);
  const [region, setRegion] = useState(null);

  const {
    data: allUsers,
    isLoading: loadingUsers,
    isFetching,
  } = useGetAllUsersQuery({ limit: 12, page, searchBy, role, region }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (allUsers) {
      setMembers((prevUsers) => {
        const combinedUsers = [...prevUsers, ...allUsers.items];
        // Use Set to remove duplicate objects based on their IDs
        const uniqueUsers = Array.from(new Set(combinedUsers.map((user) => user._id))).map((_id) =>
          combinedUsers.find((cUser) => cUser._id === _id)
        );
        return uniqueUsers;
      });

      setTotalPages(allUsers.meta?.totalPages);
    }
  }, [allUsers]);

  return (
    <AppContainer gap={16}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button onPress={() => {}} icon="filter-variant" dense style={{ paddingHorizontal: 16, paddingVertical: 4 }} />
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Search members..." />
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {members
          ?.filter((x: any) => x._id !== user?._id)
          .map((mem: any) => (
            <MemberCard
              key={mem.membershipId}
              memId={mem.membershipId}
              id={mem._id}
              fullName={mem.fullName}
              avatar={mem.avatarUrl}
              role={mem.role}
              region={mem.region}
              width="auto"
              navigation={navigation}
            />
          ))}
      </View>

      <View>
        <Button
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          loading={loadingUsers || isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </View>
    </AppContainer>
  );
};

export default MembersScreen;
