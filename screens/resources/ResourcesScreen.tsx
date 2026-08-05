import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import EmptyData from "~/components/EmptyData";
import Button from "~/components/form/Button";
import SearchBar from "~/components/form/SearchBar";
import ResourceCard from "~/components/resources/ResourceCard";
import { useGetAllResourcesQuery } from "~/store/api/resourcesApi";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

const ResourcesScreen = ({ navigation }: any) => {
  const CATEGORIES = ["Article", "Webinar", "Newsletter", "Others"];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleSelectCategory = (category: string) => {
    setResources([]);
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

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
        const uniqueResources = Array.from(new Set(combinedResources.map((res) => res._id))).map((id) =>
          combinedResources.find((res) => res._id === id)
        );
        return uniqueResources;
      });

      setTotalPages(allResources.meta.totalPages);
    }
  }, [allResources]);

  const handleDownload = async (resource: any) => {
    if (!resource.fileUrl) {
      Toast.show({ type: "info", text1: "No file available for this resource" });
      return;
    }

    setDownloadingId(resource._id);
    try {
      const fileUri = FileSystem.cacheDirectory + `${resource.slug || resource._id}.pdf`;
      const downloadResult = await FileSystem.downloadAsync(resource.fileUrl, fileUri);

      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: resource.fileType || "application/pdf",
            dialogTitle: resource.title,
          });
        } else {
          Toast.show({ type: "success", text1: "File downloaded successfully" });
        }
      } else {
        Toast.show({ type: "error", text1: "Failed to download file" });
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({ type: "error", text1: "Failed to download file" });
    } finally {
      setDownloadingId(null);
    }
  };

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

      <SearchBar
        placeholder="Search resources..."
        onSearch={(v) => {
          setResources([]);
          setSearchBy(v);
        }}
      />

      <View style={{ gap: 16 }}>
        {resources?.length || loadingResources || isFetching ? (
          resources.map((res: any) => (
            <View key={res._id} style={styles.resourceRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate("resources-single", { slug: res.slug })}
              >
                <ResourceCard
                  image={res?.featuredImage}
                  title={res?.title}
                  type={res.category}
                  subtitle={res?.description}
                  width="auto"
                />
              </TouchableOpacity>
              {res.fileUrl && (
                <TouchableOpacity
                  style={styles.downloadIcon}
                  onPress={() => handleDownload(res)}
                  disabled={downloadingId === res._id}
                >
                  <MCIcon
                    name={downloadingId === res._id ? "loading" : "download"}
                    size={20}
                    color={palette.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <EmptyData title={selectedCategory || "Resources"} icon="file" />
        )}
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

const styles = StyleSheet.create({
  resourceRow: {
    position: "relative",
  },
  downloadIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: palette.white,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ResourcesScreen;
