import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { useMarkAsReadMutation } from "~/store/api/notificationsApi";

const SingleNotificationScreen = ({ route }: any) => {
  const { item } = route?.params;

  const [markAsRead, { isLoading }] = useMarkAsReadMutation();

  useEffect(() => {
    if (!item.read) {
      markAsRead(item._id).unwrap();
    }
  }, [markAsRead, item]);

  return (
    <AppContainer>
      {isLoading ? (
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={[typography.textXl, typography.fontSemiBold]}>New {item.type}</Text>
          <Text style={[typography.textLg, typography.fontMedium, { marginVertical: 16 }]}>{item.content}</Text>
          <Text style={[typography.textBase]}>
            {formatDate(item.createdAt).date + " || " + formatDate(item.createdAt).time}
          </Text>
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
});

export default SingleNotificationScreen;
