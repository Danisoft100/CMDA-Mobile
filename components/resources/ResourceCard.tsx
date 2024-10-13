import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ResourceCard = ({ title, subtitle, type, image, width = 272, style }: any) => {
  //
  const extractLongParagraph = (html: string, title: string) => {
    const paragraphs = html.match(/<p>(.*?)<\/p>/g); // Find all <p> elements
    if (paragraphs) {
      for (const paragraph of paragraphs) {
        const cleanParagraph = paragraph.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        const withoutComments = cleanParagraph.replace(/<!--[\s\S]*?-->/g, ""); // Remove comments
        if (withoutComments.length >= 100) {
          return withoutComments;
        }
      }
    }

    return title; // Return title string if no valid paragraph found
  };

  return (
    <View style={[styles.card, { width }, style]}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.header}>
          <FontAwesome
            name={["Webinar", "Others"].includes(type) ? "youtube-play" : "newspaper-o"}
            size={18}
            color="black"
            style={{ marginBottom: 0 }}
          />
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {/* <Text style={styles.subtitle} numberOfLines={3}>
          {["Webinar", "Others"].includes(type) ? subtitle : extractLongParagraph(subtitle, title)}
        </Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderColor: palette.greyLight,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    backgroundColor: palette.onPrimary,
    height: 160,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    // alignItems: "center",
    gap: 8,
  },
  title: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    flex: 1,
    marginBottom: 4,
  },
  subtitle: {
    color: palette.greyDark,
    ...typography.textXs,
  },
});

export default ResourceCard;
