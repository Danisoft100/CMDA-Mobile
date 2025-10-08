import React, { useState, useEffect } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import { backgroundColor, textColor } from "~/constants/roleColor";
import { useGetSingleEventQuery, useGetUserPaymentPlansQuery, usePayForEventMutation, useRegisterForEventMutation } from "~/store/api/eventsApi";
import { palette, typography } from "~/theme";
import { formatDate } from "~/utils/dateFormatter";
import { formatCurrency } from "~/utils/currencyFormatter";
import { getNetworkErrorMessage } from "~/utils/networkUtils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Button from "~/components/form/Button";
import Loading from "~/components/Loading";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { CONFERENCE_TYPES, CONFERENCE_ZONES, CONFERENCE_REGIONS } from "~/constants/conferences";

const SingleConferenceScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const { user } = useSelector(selectAuth);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const { data: conference, refetch, isLoading, error } = useGetSingleEventQuery(slug, { 
    refetchOnMountOrArgChange: true 
  });
  
  const { data: paymentPlansData, refetch: refetchPaymentPlans } = useGetUserPaymentPlansQuery(slug, {
    skip: !slug,
    refetchOnMountOrArgChange: true,
  });
  
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [payForEvent, { isLoading: isPaying }] = usePayForEventMutation();

  // Conference-specific helper functions
  const getConferenceTypeLabel = (type: string) => {
    return CONFERENCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getConferenceZoneLabel = (zone: string) => {
    return CONFERENCE_ZONES.find(z => z.value === zone)?.label || zone;
  };

  const getConferenceRegionLabel = (region: string) => {
    return CONFERENCE_REGIONS.find(r => r.value === region)?.label || region;
  };
  const getCurrentRegistrationPeriod = () => {
    if (!paymentPlansData?.registrationInfo) return 'regular';
    return paymentPlansData.registrationInfo.currentPeriod?.toLowerCase() || 'regular';
  };

  const getCurrentPrice = () => {
    if (!paymentPlansData?.paymentPlans || paymentPlansData.paymentPlans.length === 0) return 0;
    
    const currentPeriod = getCurrentRegistrationPeriod();
    
    // Find payment plan for current registration period
    const plan = paymentPlansData.paymentPlans.find((p: any) => 
      p.registrationPeriod?.toLowerCase() === currentPeriod
    );
    
    // Fallback to first available plan if no period-specific plan found
    return plan?.price || paymentPlansData.paymentPlans[0]?.price || 0;
  };

  const getRegistrationStatusInfo = () => {
    if (!paymentPlansData?.registrationInfo) return { status: 'Open', color: palette.primary };
    
    const { currentPeriod, isRegistrationOpen } = paymentPlansData.registrationInfo;
    
    if (!isRegistrationOpen) {
      return { status: 'Registration Closed', color: palette.error };
    }
    
    switch (currentPeriod?.toLowerCase()) {
      case 'regular':
        return { status: 'Early Bird Registration', color: palette.success };
      case 'late':
        return { status: 'Late Registration', color: palette.warning };
      default:
        return { status: 'Open', color: palette.primary };
    }
  };

  const isRegistrationOpen = () => {
    if (!paymentPlansData?.registrationInfo) return true;
    return paymentPlansData.registrationInfo.isRegistrationOpen;
  };

  const handleConfirmRegister = () => {
    const price = getCurrentPrice();
    const registrationInfo = getRegistrationStatusInfo();
    
    if (!isRegistrationOpen()) {
      Alert.alert("Registration Closed", "Registration for this conference has ended.");
      return;
    }
    
    Alert.alert(
      "Register for Conference?",
      `${conference?.name?.toUpperCase()}\n\n` +
      `Location: ${conference?.linkOrLocation}\n` +
      `Date: ${formatDate(conference?.eventDateTime).date}\n` +
      `Time: ${formatDate(conference?.eventDateTime).time}\n` +
      `Status: ${registrationInfo.status}\n` +
      (price > 0 ? `Fee: ${formatCurrency(price, user?.role === "GlobalNetwork" ? "USD" : "NGN")}` : "Free"),
      [
        { text: "Cancel", style: "cancel" },
        { text: "Register", onPress: price > 0 ? () => setShowPaymentOptions(true) : handleFreeRegistration }
      ],
      { cancelable: true }
    );
  };

  const handleFreeRegistration = () => {
    registerForEvent({ slug })
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Successfully registered for conference!" });
        refetch();
      })      .catch((error) => {
        const errorMessage = getNetworkErrorMessage(error);
        Toast.show({ 
          type: "error", 
          text1: "Registration failed", 
          text2: errorMessage
        });
      });
  };

  const handlePaymentMethod = (method: 'paystack' | 'paypal') => {
    setShowPaymentOptions(false);
    
    payForEvent({ slug })
      .unwrap()
      .then((data) => {
        if (data.checkout_url) {
          navigation.navigate("events-payment", { 
            paymentFor: "conference", 
            checkoutUrl: data.checkout_url,
            source: method.toUpperCase()
          });
        } else {
          const approvalUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
          if (approvalUrl) {
            navigation.navigate("events-payment", { 
              paymentFor: "conference", 
              checkoutUrl: approvalUrl, 
              source: "PAYPAL" 
            });
          }
        }
      })      .catch((error) => {
        const errorMessage = getNetworkErrorMessage(error);
        Toast.show({ 
          type: "error", 
          text1: "Payment initialization failed", 
          text2: errorMessage
        });
      });
  };

  if (isLoading) {
    return (
      <AppContainer>
        <Loading marginVertical={32} />
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <View style={styles.errorContainer}>
          <FontAwesome6 name="exclamation-triangle" size={48} color={palette.error} />
          <Text style={styles.errorTitle}>Conference Not Found</Text>
          <Text style={styles.errorMessage}>
            The conference you're looking for doesn't exist or has been removed.
          </Text>
          <Button 
            label="Go Back" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: 16 }}
          />
        </View>
      </AppContainer>
    );
  }

  if (!conference) {
    return (
      <AppContainer>
        <Loading marginVertical={32} />
      </AppContainer>
    );
  }

  const registrationStatus = getRegistrationStatusInfo();
  const currentPrice = getCurrentPrice();
  const isRegistered = conference?.registeredUsers?.includes(user?._id);

  return (
    <AppContainer padding={0}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { gap: 16, marginHorizontal: 8 }]}>
          {/* Conference Type Badge */}
          <View style={styles.badgeContainer}>
            <Text style={[styles.type, { backgroundColor: palette.onTertiary, color: palette.tertiary }]}>
              {conference?.eventType}
            </Text>
            <Text style={[styles.type, { backgroundColor: palette.onSecondary, color: palette.secondary }]}>
              Conference
            </Text>
          </View>

          {/* Conference Title */}
          <Text style={[typography.textXl, typography.fontBold, { marginTop: -8 }]}>
            {conference?.name}
          </Text>

          {/* Registration Status */}
          <View style={[styles.statusBadge, { backgroundColor: `${registrationStatus.color}20` }]}>
            <Text style={[styles.statusText, { color: registrationStatus.color }]}>
              {registrationStatus.status}
            </Text>
          </View>

          {/* Featured Image */}
          <Image
            source={{ uri: conference?.featuredImageUrl }}
            style={{ height: 200, marginTop: -8, borderRadius: 12 }}
            resizeMode="cover"
          />

          {/* Description */}
          <Text style={[typography.textBase, typography.fontMedium]}>
            {conference?.description}
          </Text>

          {/* Conference Details */}
          {conference?.conferenceConfig && (
            <View style={styles.conferenceDetails}>
              <Text style={styles.label}>Conference Details</Text>
              
              {conference.conferenceConfig.type && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>
                    {getConferenceTypeLabel(conference.conferenceConfig.type)}
                  </Text>
                </View>
              )}
              
              {conference.conferenceConfig.zone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Zone:</Text>
                  <Text style={styles.detailValue}>
                    {getConferenceZoneLabel(conference.conferenceConfig.zone)}
                  </Text>
                </View>
              )}
              
              {conference.conferenceConfig.region && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Region:</Text>
                  <Text style={styles.detailValue}>
                    {getConferenceRegionLabel(conference.conferenceConfig.region)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Location */}
          <View>
            <Text style={styles.label}>Venue</Text>
            <Text style={styles.value}>{conference?.linkOrLocation}</Text>
          </View>

          {/* Date & Time */}
          <View>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.value}>
              {formatDate(conference?.eventDateTime).date} at {formatDate(conference?.eventDateTime).time}
            </Text>
          </View>          {/* Registration Periods */}
          {paymentPlansData?.registrationInfo && (
            <View>
              <Text style={styles.label}>Registration Periods</Text>
              {paymentPlansData.registrationInfo.regularEndDate && (
                <Text style={styles.value}>
                  Early Bird: Until {formatDate(paymentPlansData.registrationInfo.regularEndDate).date}
                </Text>
              )}
              {paymentPlansData.registrationInfo.lateEndDate && (
                <Text style={styles.value}>
                  Late Registration: Until {formatDate(paymentPlansData.registrationInfo.lateEndDate).date}
                </Text>
              )}
            </View>
          )}

          {/* Payment Plans */}
          {conference?.isPaid && paymentPlansData?.paymentPlans && (
            <View>
              <Text style={styles.label}>Your Registration Fee</Text>
              <Text style={styles.userMemberGroup}>
                Member Group: {paymentPlansData.userMemberGroup?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Text>
              {paymentPlansData.paymentPlans.map((plan: any) => (
                <View key={`${plan.role}-${plan.registrationPeriod || 'default'}`} style={styles.priceRow}>
                  <Text style={styles.priceRole}>
                    {plan.registrationPeriod ? `${plan.registrationPeriod} Registration` : 'Registration Fee'}
                  </Text>
                  <Text style={styles.priceAmount}>
                    {formatCurrency(plan.price, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                  </Text>
                </View>
              ))}
              
              {getCurrentPrice() > 0 && (
                <View style={[styles.currentPriceContainer, { backgroundColor: palette.primary + '20' }]}>
                  <Text style={[styles.currentPriceText, { color: palette.primary }]}>
                    Your Fee: {formatCurrency(getCurrentPrice(), user?.role === "GlobalNetwork" ? "USD" : "NGN")}
                    {getCurrentRegistrationPeriod() === 'late' && " (Late Registration)"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Members Group */}
          <View>
            <Text style={styles.label}>Target Audience</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {conference?.membersGroup?.map((grp: string) => (
                <View key={grp} style={[styles.type, { backgroundColor: backgroundColor[grp] }]}>
                  <Text style={[typography.textSm, typography.fontMedium, { color: textColor[grp] }]}>
                    {grp}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Additional Information */}
          {conference?.additionalInformation && (
            <View>
              <Text style={styles.label}>Additional Information</Text>
              <Text style={styles.value}>{conference?.additionalInformation}</Text>
            </View>
          )}

          {/* Registration Button */}
          <View style={{ alignItems: "flex-end", marginTop: 16 }}>
            <Button
              label={
                isRegistered 
                  ? "Already Registered" 
                  : !isRegistrationOpen()
                  ? "Registration Closed"
                  : currentPrice > 0
                  ? `Register - ${formatCurrency(currentPrice, user?.role === "GlobalNetwork" ? "USD" : "NGN")}`
                  : "Register for Free"
              }
              onPress={handleConfirmRegister}
              loading={isRegistering || isPaying}
              disabled={isRegistered || !isRegistrationOpen()}
              style={[
                isRegistered && { backgroundColor: palette.success },
                !isRegistrationOpen() && { backgroundColor: palette.grey }
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>
            <Text style={styles.modalSubtitle}>
              Conference Fee: {formatCurrency(currentPrice, user?.role === "GlobalNetwork" ? "USD" : "NGN")}
            </Text>
            
            <Button
              label="Pay with Paystack (Card/Bank)"
              onPress={() => handlePaymentMethod('paystack')}
              style={{ marginBottom: 12, backgroundColor: palette.success }}
              loading={isPaying}
            />
            
            {user?.role === "GlobalNetwork" && (
              <Button
                label="Pay with PayPal"
                onPress={() => handlePaymentMethod('paypal')}
                style={{ marginBottom: 12, backgroundColor: '#0070ba' }}
                loading={isPaying}
              />
            )}
            
            <Button
              label="Cancel"
              onPress={() => setShowPaymentOptions(false)}
              variant="outlined"
            />
          </View>
        </View>
      )}
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.textSm,
    ...typography.fontSemiBold,
  },
  conferenceDetails: {
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.grey,
  },
  detailValue: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
  },
  label: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.grey,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { 
    ...typography.textBase, 
    ...typography.fontMedium, 
    color: palette.black,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  priceRole: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.black,
  },
  priceAmount: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
  currentPriceContainer: {
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },  currentPriceText: {
    ...typography.textSm,
    ...typography.fontSemiBold,
    textAlign: 'center',
  },
  userMemberGroup: {
    ...typography.textSm,
    color: palette.grey,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    ...typography.textBase,
    color: palette.grey,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: palette.white,
    padding: 24,
    borderRadius: 12,
    margin: 20,
    width: '90%',
  },
  modalTitle: {
    ...typography.textLg,
    ...typography.fontBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.textBase,
    color: palette.grey,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SingleConferenceScreen;
