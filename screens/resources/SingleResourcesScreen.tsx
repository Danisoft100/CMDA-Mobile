import React, { useCallback, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { useGetResourceBySlugQuery } from "~/store/api/resourcesApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";
import { LogBox } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import Loading from "~/components/Loading";

// ignore react-native-render-html warnings
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

  const onStateChange = useCallback((state: any) => {
    console.log('state', state)
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

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

          {["Artice", "Newsletter"].includes(singleRes?.category) && (
            <Image
              source={{ uri: singleRes?.featuredImage }}
              style={{ height: 200, marginTop: -8 }}
              resizeMode="contain"
            />
          )}

          {["Artice", "Newsletter"].includes(singleRes?.category) ? (
            <RenderHTML
              contentWidth={width - 64}
              source={{ html: singleRes?.description }}
              systemFonts={systemFonts}
              tagsStyles={tagsStyles}
            />
          ) : (
            <Text style={[typography.textBase, typography.fontMedium, { marginTop: -8 }]}>
              {singleRes?.description}
            </Text>
          )}

          {["Webinar", "Others"].includes(singleRes?.category) && (
            <View style={{ marginTop: 16 }}>
              <YoutubePlayer height={200} play={playing} videoId={slug} onChangeState={onStateChange} />
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
});

export default SingleResourcesScreen;
