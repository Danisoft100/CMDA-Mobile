import React, { useState } from "react";
import { Alert, Image, Linking, Platform, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import VirtualMeetingCard from "~/components/VirtualMeetingCard";
import EventCommentsSection from "~/components/events/EventCommentsSection";
import ReactionBar from "~/components/events/ReactionBar";
import { backgroundColor, textColor } from "~/constants/roleColor";
import {
  useGetSingleEventQuery,
  useGetUserPaymentPlansQuery,
  usePayForEventMutation,
  useRegisterForEventMutation,
} from "~/store/api/eventsApi";
import { useCreateEventReminderMutation } from "~/store/api/personalEventsApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Button from "~/components/form/Button";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { formatCurrency } from "~/utils/currencyFormatter";

const isUrl = (str: string) => {
  if (!str) return false;
  return /^https?:\/\//i.test(str) || /^www\./i.test(str);
};

const SingleEventsScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const { user } = useSelector(selectAuth);
  const [showReminderInput, setShowReminderInput] = useState(false);
  const [reminderDate, setReminderDate] = useState("");

  const { data: singleEvent, refetch } = useGetSingleEventQuery(slug, { refetchOnMountOrArgChange: true });
  const { data: paymentPlansData } = useGetUserPaymentPlansQuery(slug, { refetchOnMountOrArgChange: true });
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [createEventReminder, { isLoading: isSettingReminder }] = useCreateEventReminderMutation();

  const isPastEvent = singleEvent?.eventDateTime
    ? new Date(singleEvent.eventDateTime) < new Date()
    : false;
  const eventId = singleEvent?._id;

  const handleShare = async (social: string) => {
    const pageUrl = `https://cmdanigeria.org/events/${slug}`;
    const shareText = singleEvent?.name || "CMDA Event";
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + pageUrl)}`,
      linkedIn: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`,
    };
    try {
      if (social === "whatsapp" || social === "twitter") {
        const canOpen = await Linking.canOpenURL(urls[social]);
        if (canOpen) {
          await Linking.openURL(urls[social]);
          return;
        }
      }
      await Share.share({
        message: Platform.OS === "android" ? `${shareText}\n${pageUrl}` : shareText,
        url: pageUrl,
        title: shareText,
      });
    } catch (error) {
      console.error("[SingleEventsScreen] Share error:", error);
    }
  };

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
        })
        .catch((error) => {
          if (error?.status === 403 || error?.data?.message?.includes("subscription")) {
            Alert.alert(
              "Subscription Required",
              "You must have an active subscription to register for events. Please subscribe first.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Subscribe Now", onPress: () => navigation.navigate("payment", { screen: "pay-index", params: { activeIndex: 0 } }) }
              ]
            );
          } else {
            Toast.show({ type: "error", text1: error?.data?.message || "Failed to pay for event" });
          }
        });
    } else {
      registerForEvent({ slug })
        .unwrap()
        .then(() => {
          Toast.show({ type: "success", text1: "Registered for event successfully" });
          refetch();
        })
        .catch((error) => {
          if (error?.status === 403 || error?.data?.message?.includes("subscription")) {
            Alert.alert(
              "Subscription Required",
              "You must have an active subscription to register for events. Please subscribe first.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Subscribe Now", onPress: () => navigation.navigate("payment", { screen: "pay-index", params: { activeIndex: 0 } }) }
              ]
            );
          } else {
            Toast.show({ type: "error", text1: error?.data?.message || "Failed to register for event" });
          }
        });
    }
  };

  const paymentBreakdown = paymentPlansData?.paymentBreakdown;
  const hasExternalUrl = Boolean(singleEvent?.externalUrl);

  const handleSetReminder = () => {
    if (!reminderDate.trim()) {
      Toast.show({ type: "error", text1: "Please enter a reminder date (YYYY-MM-DD)" });
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(reminderDate)) {
      Toast.show({ type: "error", text1: "Date must be in YYYY-MM-DD format" });
      return;
    }
    createEventReminder({ eventId, reminderDate, method: "push" })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Reminder set!" });
        setShowReminderInput(false);
        setReminderDate("");
      })
      .catch((err) => {
        Toast.show({ type: "error", text1: err?.data?.message || "Failed to set reminder" });
      });
  };

  return (
    <AppContainer padding={0}>
      <View style={[styles.card, { gap: 16, marginHorizontal: 8 }]}>
        <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>
          {singleEvent?.eventType}
        </Text>

        <Text style={[typography.textXl, typography.fontBold, { marginTop: -8 }]}>{singleEvent?.name}</Text>

        {eventId && <ReactionBar parentType="event" parentId={eventId} />}

        <Image
          source={{ uri: singleEvent?.featuredImageUrl }}
          style={{ height: 200, marginTop: -8 }}
          resizeMode="contain"
        />

        <Text style={[typography.textBase, typography.fontMedium]}>{singleEvent?.description}</Text>

        <View>
          <Text style={styles.label}>Location</Text>
          {isUrl(singleEvent?.linkOrLocation) ? (
            <Text
              style={[styles.value, { color: palette.primary, textDecorationLine: "underline" }]}
              onPress={() => Linking.openURL(singleEvent?.linkOrLocation?.startsWith("http") ? singleEvent.linkOrLocation : `https://${singleEvent.linkOrLocation}`)}
            >
              {singleEvent?.linkOrLocation}
            </Text>
          ) : (
            <Text style={styles.value}>{singleEvent?.linkOrLocation}</Text>
          )}
        </View>

        {singleEvent?.externalUrl ? (
          <View>
            <Text style={styles.label}>External URL</Text>
            <Text
              style={[styles.value, { color: palette.primary, textDecorationLine: "underline" }]}
              onPress={() => Linking.openURL(singleEvent?.externalUrl?.startsWith("http") ? singleEvent.externalUrl : `https://${singleEvent.externalUrl}`)}
            >
              {singleEvent?.externalUrl}
            </Text>
          </View>
        ) : null}

        <View>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {formatDate(singleEvent?.eventDateTime).date + " || " + formatDate(singleEvent?.eventDateTime).time}
          </Text>
        </View>

        {singleEvent?.isPaid ? (
          <View>
            <Text style={styles.label}>Payment Plans</Text>
            {singleEvent?.paymentPlans.map((x: any, index: number) => (
              <Text key={`${x.role}-${index}`} style={styles.value}>
                {x.role}
                {x.registrationPeriod ? ` - ${x.registrationPeriod}` : ""}
                {" - " + formatCurrency(x.price, x.role === "GlobalNetwork" ? "USD" : "NGN")}
              </Text>
            ))}

            {paymentBreakdown && (
              <View style={styles.breakdownCard}>
                <Text style={[typography.textSm, typography.fontBold, { color: palette.primary, marginBottom: 4 }]}>
                  {paymentBreakdown.includesFees ? "Your Payment Breakdown:" : "Payment Information:"}
                </Text>
                {paymentBreakdown.includesFees ? (
                  <>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Event Fee:</Text>
                      <Text style={styles.breakdownValue}>
                        {formatCurrency(paymentBreakdown.baseAmount, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Processing Fee:</Text>
                      <Text style={styles.breakdownValue}>
                        {formatCurrency(paymentBreakdown.feeBreakdown?.totalFees, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                      </Text>
                    </View>
                    <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: palette.greyLight, paddingTop: 4 }]}>
                      <Text style={[styles.breakdownLabel, typography.fontBold]}>Total:</Text>
                      <Text style={[styles.breakdownValue, typography.fontBold, { color: palette.primary }]}>
                        {formatCurrency(paymentBreakdown.chargeAmount, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                      </Text>
                    </View>
                    <Text style={[typography.textXs, { color: palette.grey, marginTop: 4 }]}>
                      Processing fee ensures the organization receives the full event fee.
                    </Text>
                  </>
                ) : (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, typography.fontBold]}>Registration Fee:</Text>
                    <Text style={[styles.breakdownValue, typography.fontBold, { color: palette.primary }]}>
                      {formatCurrency(paymentBreakdown.baseAmount, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                    </Text>
                  </View>
                )}
              </View>
            )}
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

        {/* Event Tags */}
        {singleEvent?.eventTags?.length > 0 && (
          <View>
            <Text style={styles.label}>Tags</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {singleEvent.eventTags.map((tag: string, index: number) => (
                <View key={`${tag}-${index}`} style={styles.tag}>
                  <Text style={[typography.textXs, typography.fontMedium, { color: palette.greyDark }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Virtual Meeting Info */}
        {(singleEvent?.eventType === "Virtual" || singleEvent?.eventType === "Hybrid") &&
          singleEvent?.virtualMeetingInfo &&
          singleEvent?.registeredUsers?.includes(user?._id) && (
            <View style={{ marginVertical: 16 }}>
              <Text style={styles.label}>Virtual Meeting</Text>
              <VirtualMeetingCard meetingInfo={singleEvent.virtualMeetingInfo} eventName={singleEvent.name} eventDateTime={singleEvent.eventDateTime} />
            </View>
          )}

        {/* Social Sharing */}
        <View>
          <Text style={styles.label}>Share this Event</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            {[
              { name: "facebook", icon: "facebook" },
              { name: "twitter", icon: "x-twitter" },
              { name: "whatsapp", icon: "whatsapp" },
              { name: "linkedIn", icon: "linkedin" },
            ].map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.socialIcon}
                onPress={() => handleShare(item.name)}
              >
                <FontAwesome6 name={item.icon} size={18} color={palette.greyDark} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 8 }}>
          {eventId && (
            <Button
              label="See Attendees"
              variant="outlined"
              icon="account-group"
              onPress={() => navigation.navigate("event-attendees", { eventId })}
            />
          )}

          {isPastEvent && eventId && (
            <Button
              label="Rate This Event"
              variant="outlined"
              icon="star"
              onPress={() => navigation.navigate("event-feedback", { eventId })}
            />
          )}

          {eventId && !isPastEvent && (
            <>
              {showReminderInput ? (
                <View style={styles.reminderCard}>
                  <Text style={[typography.textSm, typography.fontSemiBold, { marginBottom: 4 }]}>
                    Reminder Date (YYYY-MM-DD)
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={styles.reminderInput}
                      placeholder="2025-12-25"
                      placeholderTextColor={palette.grey}
                      value={reminderDate}
                      onChangeText={setReminderDate}
                      keyboardType="numbers-and-punctuation"
                    />
                    <Button
                      label="Set"
                      dense
                      onPress={handleSetReminder}
                      loading={isSettingReminder}
                      disabled={!reminderDate.trim()}
                    />
                    <Button
                      label="Cancel"
                      dense
                      variant="outlined"
                      onPress={() => {
                        setShowReminderInput(false);
                        setReminderDate("");
                      }}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  label="Set Reminder"
                  variant="outlined"
                  icon="bell"
                  onPress={() => setShowReminderInput(true)}
                />
              )}
            </>
          )}
        </View>

        {singleEvent?.requiresSubscription !== false && !user.subscribed && !hasExternalUrl && (
          <View style={{ 
            padding: 12, 
            backgroundColor: palette.error + "20", 
            borderColor: palette.error, 
            borderWidth: 1, 
            borderRadius: 8 
          }}>
            <Text style={[typography.textSm, typography.fontMedium, { color: palette.error }]}>
              You need an active subscription to register for this event.{" "}
              <Text 
                style={[typography.fontBold, { textDecorationLine: "underline" }]}
                onPress={() => navigation.navigate("payment", { screen: "pay-index", params: { activeIndex: 0 } })}
              >
                Subscribe now
              </Text>
            </Text>
          </View>
        )}

        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          {hasExternalUrl ? (
            <Button
              label="Open Event Link"
              onPress={() => Linking.openURL(singleEvent?.externalUrl?.startsWith("http") ? singleEvent.externalUrl : `https://${singleEvent.externalUrl}`)}
            />
          ) : (
            <Button
              label={singleEvent?.registeredUsers?.includes(user?._id) ? "Already Registered" : "Register for Event"}
              onPress={handleConfirmRegister}
              loading={isRegistering || isPaying}
              disabled={
                (singleEvent?.requiresSubscription !== false && !user.subscribed) ||
                singleEvent?.registeredUsers?.includes(user?._id)
              }
            />
          )}
        </View>

        {/* Comments Section */}
        {eventId && (
          <View style={{ marginTop: 8 }}>
            <EventCommentsSection eventId={eventId} />
          </View>
        )}
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
    height: 40,
    width: 40,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: palette.greyLight,
    alignSelf: "flex-start",
  },
  breakdownCard: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  breakdownLabel: { ...typography.textSm, color: palette.greyDark },
  breakdownValue: { ...typography.textSm, ...typography.fontMedium, color: palette.black },
  reminderCard: {
    padding: 12,
    backgroundColor: palette.onPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.primary + "30",
  },
  reminderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...typography.textSm,
    color: palette.black,
    backgroundColor: palette.white,
  },
});

export default SingleEventsScreen;
