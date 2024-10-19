import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import SelectField from "~/components/form/SelectField";
import MemberCard from "~/components/member/MemberCard";
import { DOCTOR_REGIONS, GLOBAL_NETWORK_REGIONS, STUDENT_REGIONS } from "~/constants/regions";
import { useGetAllUsersQuery } from "~/store/api/membersApi";
import { typography } from "~/theme";

const MembersScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: any) => state.auth);

  const [members, setMembers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");
  const [role, setRole] = useState<string>("");
  const [region, setRegion] = useState<string>("");

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

  const { control } = useForm({ mode: "all" });

  return (
    <AppContainer gap={16}>
      <View style={{ gap: 8 }}>
        <SearchBar
          placeholder="Search members..."
          onSearch={(v) => {
            setMembers([]);
            setSearchBy(v);
          }}
        />
        <View style={{ flex: 1, flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {["Student", "Doctor", "GlobalNetwork"].map((item) => (
            <Button
              key={item}
              dense
              label={item}
              variant={role === item ? "filled" : "outlined"}
              onPress={() => {
                setMembers([]);
                setRegion("");
                setRole((prev) => (prev === item ? "" : item));
              }}
            />
          ))}
        </View>

        {role && (
          <SelectField
            label="region"
            showLabel={false}
            placeholder="Select Chapter/Region"
            control={control}
            options={role === "Student" ? STUDENT_REGIONS : role === "Doctor" ? DOCTOR_REGIONS : GLOBAL_NETWORK_REGIONS}
            errors={{}}
            onSelect={(v: string) => {
              setMembers([]);
              setRegion(v);
            }}
          />
        )}
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
