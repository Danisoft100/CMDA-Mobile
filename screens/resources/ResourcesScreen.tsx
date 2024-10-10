import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ResourceCard from "~/components/resources/ResourceCard";
import { useGetAllResourcesQuery } from "~/store/api/resourcesApi";
import { typography } from "~/theme";

const ResourcesScreen = () => {
  const CATEGORIES = ["Article", "Webinar", "Newsletter", "Others"];

  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSelectCategory = (category: string) => {
    setResources([]);
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

  const { control, handleSubmit } = useForm({ mode: "all" });

  const [resources, setResources] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBy, setSearchBy] = useState("");

  const {
    data: allResources,
    isLoading: loadingResources,
    isFetching,
  } = useGetAllResourcesQuery({ page, limit: 12, searchBy, category: selectedCategory });

  useEffect(() => {
    if (allResources) {
      setResources((prevResources: any[]) => {
        const combinedResources = [...prevResources, ...allResources.items];
        // Use Set to remove duplicate objects based on their IDs
        const uniqueResources = Array.from(new Set(combinedResources.map((res) => res._id))).map((id) =>
          combinedResources.find((res) => res._id === id)
        );
        return uniqueResources;
      });

      setTotalPages(allResources.meta.totalPages);
    }
  }, [allResources]);

  return (
    <AppContainer gap={20}>
      <Text style={[typography.textXl, typography.fontBold, { marginTop: 16 }]}>Resources</Text>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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

      <SearchBar placeholder="Search resources..." onSearch={(v) => setSearchBy(v)} />

      <View style={{ gap: 16 }}>
        {resources.map((res: any) => (
          <ResourceCard
            key={res._id}
            image={res?.featuredImage}
            title={res?.title}
            type={res.category}
            subtitle={res?.description}
            width="auto"
          />
        ))}
      </View>

      <View>
        <Button
          disabled={page === totalPages}
          label={page === totalPages ? "The End" : "Load More"}
          loading={loadingResources || isFetching}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </View>
    </AppContainer>
  );
};

export default ResourcesScreen;
