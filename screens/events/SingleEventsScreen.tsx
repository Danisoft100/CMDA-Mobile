import React from "react";
import { Alert, Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import { backgroundColor, textColor } from "~/constants/roleColor";
import { useGetSingleEventQuery, usePayForEventMutation, useRegisterForEventMutation } from "~/store/api/eventsApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Button from "~/components/form/Button";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatCurrency } from "~/utils/currencyFormatter";

const SingleEventsScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const { user } = useSelector(selectAuth);

  const { data: singleEvent, refetch } = useGetSingleEventQuery(slug, { refetchOnMountOrArgChange: true });
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();

  const handleShare = (social: string) => alert("Sharing on " + social);

  const handleConfirmRegister = () => {
    Alert.alert(
      "Register for this Event?",
      singleEvent?.name?.toUpperCase() +
        " happening at " +
        singleEvent?.linkOrLocation +
        " on " +
        formatDate(singleEvent?.eventDateTime).date +
        " || " +
        formatDate(singleEvent?.eventDateTime).time,
      [{ text: "No, Cancel" }, { text: "Yes, Register", onPress: handleRegisterEvent }],
      { cancelable: true }
    );
  };

  const [payForEvent, { isLoading: isPaying }] = usePayForEventMutation();

  const handleRegisterEvent = () => {
    if (singleEvent?.isPaid) {
      payForEvent({ slug })
        .unwrap()
        .then((data) => {
          if (data.checkout_url) {
            navigation.navigate("events-payment", { paymentFor: "event", checkoutUrl: data.checkout_url });
          } else {
            const approvalUrl = data.links.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
            navigation.navigate("events-payment", { paymentFor: "event", checkoutUrl: approvalUrl, source: "PAYPAL" });
          }
        });
    } else {
      registerForEvent({ slug })
        .unwrap()
        .then(() => {
          Toast.show({ type: "success", text1: "Registered for event successfully" });
          refetch();
        });
    }
  };

  return (
    <AppContainer padding={0}>
      <View style={[styles.card, { gap: 16, marginHorizontal: 8 }]}>
        <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>
          {singleEvent?.eventType}
        </Text>

        <Text style={[typography.textXl, typography.fontBold, { marginTop: -8 }]}>{singleEvent?.name}</Text>

        <Image
          source={{ uri: singleEvent?.featuredImageUrl }}
          style={{ height: 200, marginTop: -8 }}
          resizeMode="contain"
        />

        <Text style={[typography.textBase, typography.fontMedium]}>{singleEvent?.description}</Text>

        <View>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{singleEvent?.linkOrLocation}</Text>
        </View>

        <View>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {formatDate(singleEvent?.eventDateTime).date + " || " + formatDate(singleEvent?.eventDateTime).time}
          </Text>
        </View>

        {singleEvent?.isPaid ? (
          <View>
            <Text style={styles.label}>Payment Plans</Text>
            {singleEvent?.paymentPlans.map((x: any) => (
              <Text key={x.role} style={styles.value}>
                {x.role + " - " + formatCurrency(x.price, x.role === "GlobalNetwork" ? "USD" : "NGN")}
              </Text>
            ))}
          </View>
        ) : null}

        <View>
          <Text style={styles.label}>Members Group</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {singleEvent?.membersGroup?.map((grp: string) => (
              <View key={grp} style={[styles.type, { backgroundColor: backgroundColor[grp] }]}>
                <Text style={[typography.textSm, typography.fontMedium, { color: textColor[grp] }]}>{grp}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Additional Info</Text>
          <Text style={styles.value}>{singleEvent?.additionalInformation}</Text>
        </View>

        {/* <View>
          <Text style={styles.label}>Share this event</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["facebook-f", "x-twitter", "whatsapp", "linkedin-in", "instagram"].map((item) => (
              <TouchableOpacity key={item} style={styles.socialIcon}>
                <FontAwesome6 name={item} size={18} color="black" />
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          <Button
            label={singleEvent?.registeredUsers?.includes(user?._id) ? "Already Registered" : "Register for Event"}
            onPress={handleConfirmRegister}
            loading={isRegistering || isPaying}
            disabled={singleEvent?.registeredUsers?.includes(user?._id)}
          />
        </View>
      </View>
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
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.grey,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { ...typography.textBase, ...typography.fontMedium, color: palette.black },
  socialIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.greyLight,
    borderRadius: 20,
    height: 36,
    width: 36,
  },
});

export default SingleEventsScreen;
