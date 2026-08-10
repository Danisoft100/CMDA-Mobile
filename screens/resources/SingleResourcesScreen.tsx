import React, { useCallback, useState } from "react";
import { Alert, Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { useGetResourceBySlugQuery } from "~/store/api/resourcesApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";
import { LogBox } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import Loading from "~/components/Loading";
import Button from "~/components/form/Button";
import * as FileSystem from "expo-file-system";
import { Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

LogBox.ignoreLogs(["Support for defaultProps will be removed from"]);

const SingleResourcesScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const { data: singleRes = {}, isLoading, isFetching } = useGetResourceBySlugQuery(slug, { refetchOnMountOrArgChange: true });
  const { width } = Dimensions.get("window");

  const systemFonts = ["Raleway_500Medium", "Raleway_600SemiBold", ...defaultSystemFonts];

  const tagsStyles = {
    body: { fontFamily: "Raleway_500Medium", fontSize: 16, lineHeight: 24 },
    h1: { fontFamily: "Raleway_600SemiBold" },
    h2: { fontFamily: "Raleway_600SemiBold" },
    h3: { fontFamily: "Raleway_600SemiBold" },
    h4: { fontFamily: "Raleway_600SemiBold" },
    h5: { fontFamily: "Raleway_600SemiBold" },
    h6: { fontFamily: "Raleway_600SemiBold" },
    a: { color: palette.primary, fontFamily: "Raleway_600SemiBold" },
  };

  const [playing, setPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const getFileExtension = (url: string) => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1] : "pdf";
  };

  const getFileSize = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch (error) {
      // Ignore error
    }
    return null;
  };

  const handleDownload = async () => {
    if (!singleRes?.fileUrl) {
      Toast.show({ type: "info", text1: "No file available for this resource" });
      return;
    }

    setIsDownloading(true);
    try {
      const ext = getFileExtension(singleRes.fileUrl);
      const fileName = `${singleRes.slug || singleRes._id}.${ext}`;
      const fileUri = Paths.document + `/${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(singleRes.fileUrl, fileUri);

      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: singleRes.fileType || `application/${ext}`,
            dialogTitle: singleRes.title,
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
      setIsDownloading(false);
    }
  };

  const handleOpenInBrowser = () => {
    if (singleRes?.fileUrl) {
      Linking.openURL(singleRes.fileUrl);
    }
  };

  return (
    <AppContainer>
      {isLoading || isFetching ? (
        <Loading />
      ) : (
        <View style={[styles.card, { gap: 16 }]}>
          <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>
            {singleRes?.category}
          </Text>

          <Text style={[typography.textXl, typography.fontBold]}>{singleRes?.title}</Text>

          {["Article", "Newsletter"].includes(singleRes?.category) && (
            <Image
              source={{ uri: singleRes?.featuredImage }}
              style={{ height: 200, marginTop: -8 }}
              resizeMode="contain"
            />
          )}

          {singleRes?.description ? (
            <RenderHTML
              contentWidth={width - 64}
              source={{ html: singleRes?.description }}
              systemFonts={systemFonts}
              tagsStyles={tagsStyles}
            />
          ) : null}

          {["Webinar", "Others"].includes(singleRes?.category) && (
            <View style={{ marginTop: 16 }}>
              <YoutubePlayer height={200} play={playing} videoId={slug} onChangeState={onStateChange} />
            </View>
          )}

          {/* Download Section */}
          {singleRes?.fileUrl && (
            <View style={styles.downloadSection}>
              <View style={styles.fileInfo}>
                <MCIcon name="file-document" size={24} color={palette.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.textSm, typography.fontSemiBold]}>Attached File</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
                    {singleRes.fileType && (
                      <Text style={[typography.textXs, { color: palette.greyDark }]}>
                        {singleRes.fileType.split("/").pop()?.toUpperCase() || "FILE"}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.downloadActions}>
                <Button
                  label="Download"
                  dense
                  icon="download"
                  onPress={handleDownload}
                  loading={isDownloading}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Open in Browser"
                  variant="outlined"
                  dense
                  icon="open-in-new"
                  onPress={handleOpenInBrowser}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          <View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {singleRes?.tags?.map((tag: string) => (
                <View key={tag} style={[styles.type, { backgroundColor: palette.greyLight }]}>
                  <Text style={[typography.textSm, typography.fontMedium, { color: palette.black }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Posted on</Text>
            <Text style={styles.value}>
              {formatDate(singleRes?.createdAt).date + " || " + formatDate(singleRes?.createdAt).time}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {singleRes?.author?.avatarUrl ? (
              <Image source={{ uri: singleRes?.author?.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarIcon, { backgroundColor: palette.onPrimary }]}>
                <MCIcon name="account" size={24} color={palette.primary} />
              </View>
            )}
            <Text style={styles.value}>{singleRes?.author?.name}</Text>
          </View>
        </View>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...typography.textXs,
    ...typography.fontSemiBold,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  label: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.grey,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  value: { ...typography.textBase, ...typography.fontMedium, color: palette.black },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    overflow: "hidden",
  },
  avatarIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.onPrimary,
    borderRadius: 40,
    height: 40,
    width: 40,
  },
  downloadSection: {
    backgroundColor: palette.background,
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  downloadActions: {
    flexDirection: "row",
    gap: 8,
  },
});

export default SingleResourcesScreen;
