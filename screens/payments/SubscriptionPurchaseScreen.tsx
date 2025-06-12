import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette, typography } from "~/theme";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { useRoles } from "~/utils/useRoles";
import { INCOME_BRACKETS, GLOBAL_INCOME_BASED_PRICING, LIFETIME_MEMBERSHIPS } from "~/constants/payments";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import { useInitSubscriptionSessionMutation } from "~/store/api/paymentsApi";
import AppContainer from "~/components/AppContainer";

const SubscriptionPurchaseScreen = ({ navigation }: any) => {
  const { user } = useSelector(selectAuth);
  const { isGlobalNetwork } = useRoles();
  
  const [selectedIncomeBracket, setSelectedIncomeBracket] = useState<string>(
    user?.incomeBracket || INCOME_BRACKETS[0].value
  );
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [selectedLifetimePlan, setSelectedLifetimePlan] = useState<string | null>(null);
  const [isLifetime, setIsLifetime] = useState(false);
  const [isVisionPartner, setIsVisionPartner] = useState(false);

  const [initSubscription, { isLoading }] = useInitSubscriptionSessionMutation();

  const getSelectedPricing = () => {
    if (!isGlobalNetwork) return null;
    return GLOBAL_INCOME_BASED_PRICING[selectedIncomeBracket as keyof typeof GLOBAL_INCOME_BASED_PRICING];
  };

  const handleSubscribe = () => {
    const pricing = getSelectedPricing();
    if (!pricing && !isLifetime) return;

    let amount = 0;
    let subscriptionData: any = {
      isGlobalNetwork: true,
      incomeBracket: selectedIncomeBracket,
      isLifetime,
      isVisionPartner,
    };

    if (isLifetime && selectedLifetimePlan) {
      const lifetimePlan = LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS];
      amount = lifetimePlan.price;
      subscriptionData.lifetimeType = selectedLifetimePlan;
      subscriptionData.frequency = 'lifetime';
    } else if (pricing) {
      amount = pricing[selectedPlan];
      subscriptionData.frequency = selectedPlan;
    }

    const confirmMessage = isLifetime 
      ? `Subscribe to ${LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS]?.label} for ${formatCurrency(amount, 'USD')}?`
      : `Subscribe ${selectedPlan}ly for ${formatCurrency(amount, 'USD')}?`;

    Alert.alert(
      "Confirm Subscription",
      confirmMessage,
      [
        { text: "Cancel" },
        { 
          text: "Proceed", 
          onPress: () => {
            initSubscription(subscriptionData)
              .unwrap()
              .then((data) => {
                if (data.checkout_url) {
                  navigation.navigate("pay-init", { 
                    paymentFor: "subscription", 
                    checkoutUrl: data.checkout_url 
                  });
                } else {
                  const approvalUrl = data.links.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
                  navigation.navigate("pay-init", { 
                    paymentFor: "subscription", 
                    checkoutUrl: approvalUrl, 
                    source: "PAYPAL" 
                  });
                }
              })
              .catch((error) => {
                Alert.alert("Error", "Failed to initialize subscription. Please try again.");
              });
          }
        }
      ]
    );
  };

  if (!isGlobalNetwork) {
    return (
      <AppContainer>
        <View style={styles.container}>
          <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 20 }]}>
            Subscription
          </Text>
          <Text style={[typography.textBase, { textAlign: 'center', marginBottom: 20 }]}>
            Income-based pricing is available for Global Network members only.
          </Text>
          <Button
            label="Subscribe"
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: palette.primary }}
          />
        </View>
      </AppContainer>
    );
  }

  const pricing = getSelectedPricing();

  return (
    <AppContainer>
      <ScrollView style={styles.container}>
        <Text style={[typography.textLg, typography.fontSemiBold, { marginBottom: 20 }]}>
          Choose Your Subscription
        </Text>

        {/* Subscription Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isLifetime && styles.toggleButtonActive]}
            onPress={() => setIsLifetime(false)}
          >
            <Text style={[styles.toggleText, !isLifetime && styles.toggleTextActive]}>
              Regular Subscription
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isLifetime && styles.toggleButtonActive]}
            onPress={() => setIsLifetime(true)}
          >
            <Text style={[styles.toggleText, isLifetime && styles.toggleTextActive]}>
              Lifetime Membership
            </Text>
          </TouchableOpacity>
        </View>

        {!isLifetime && (
          <>
            {/* Income Bracket Selection */}
            <View style={styles.section}>
              <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 12 }]}>
                Select Your Income Bracket
              </Text>
              {INCOME_BRACKETS.map((bracket) => (
                <TouchableOpacity
                  key={bracket.value}
                  style={[
                    styles.optionButton,
                    selectedIncomeBracket === bracket.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedIncomeBracket(bracket.value)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedIncomeBracket === bracket.value && styles.optionTextSelected
                  ]}>
                    {bracket.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Plan Selection */}
            <View style={styles.section}>
              <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 12 }]}>
                Select Plan
              </Text>
              <View style={styles.planContainer}>
                <TouchableOpacity
                  style={[styles.planButton, selectedPlan === 'monthly' && styles.planButtonSelected]}
                  onPress={() => setSelectedPlan('monthly')}
                >
                  <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.planTitleSelected]}>
                    Monthly
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>
                    {pricing ? formatCurrency(pricing.monthly, 'USD') : '$0'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.planButton, selectedPlan === 'annual' && styles.planButtonSelected]}
                  onPress={() => setSelectedPlan('annual')}
                >
                  <Text style={[styles.planTitle, selectedPlan === 'annual' && styles.planTitleSelected]}>
                    Annual
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'annual' && styles.planPriceSelected]}>
                    {pricing ? formatCurrency(pricing.annual, 'USD') : '$0'}
                  </Text>
                  <Text style={styles.planSavings}>Save 2 months!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {isLifetime && (
          <View style={styles.section}>
            <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 12 }]}>
              Select Lifetime Membership
            </Text>
            {Object.entries(LIFETIME_MEMBERSHIPS).map(([key, membership]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.lifetimeOption,
                  selectedLifetimePlan === key && styles.lifetimeOptionSelected
                ]}
                onPress={() => setSelectedLifetimePlan(key)}
              >
                <View style={styles.lifetimeContent}>
                  <Text style={[styles.lifetimeTitle, selectedLifetimePlan === key && styles.lifetimeTitleSelected]}>
                    {membership.label}
                  </Text>
                  <Text style={[styles.lifetimePrice, selectedLifetimePlan === key && styles.lifetimePriceSelected]}>
                    {formatCurrency(membership.price, 'USD')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Vision Partner Option */}
        <TouchableOpacity
          style={[styles.visionPartnerContainer, isVisionPartner && styles.visionPartnerSelected]}
          onPress={() => setIsVisionPartner(!isVisionPartner)}
        >
          <Text style={[styles.visionPartnerText, isVisionPartner && styles.visionPartnerTextSelected]}>
            ✓ Join as Vision Partner (Additional support for CMDA's mission)
          </Text>
        </TouchableOpacity>

        <Button
          label={isLifetime ? "Purchase Lifetime Membership" : "Subscribe"}
          onPress={handleSubscribe}
          loading={isLoading}
          disabled={!pricing && !isLifetime}
          style={{ 
            backgroundColor: palette.primary, 
            marginTop: 20,
            marginBottom: 40 
          }}
        />
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: palette.greyLight,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: palette.primary,
  },
  toggleText: {
    ...typography.textSm,
    color: palette.grey,
  },
  toggleTextActive: {
    color: palette.white,
    ...typography.fontSemiBold,
  },
  section: {
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    marginBottom: 8,
  },  optionButtonSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.onPrimary,
  },
  optionText: {
    ...typography.textBase,
    color: palette.grey,
  },
  optionTextSelected: {
    color: palette.primary,
    ...typography.fontSemiBold,
  },
  planContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  planButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    alignItems: 'center',
  },  planButtonSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.onPrimary,
  },
  planTitle: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.grey,
    marginBottom: 8,
  },
  planTitleSelected: {
    color: palette.primary,
  },
  planPrice: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.grey,
  },
  planPriceSelected: {
    color: palette.primary,
  },
  planSavings: {
    ...typography.textSm,
    color: palette.secondary,
    marginTop: 4,
  },
  lifetimeOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    marginBottom: 8,
  },  lifetimeOptionSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.onPrimary,
  },
  lifetimeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifetimeTitle: {
    ...typography.textBase,
    color: palette.grey,
  },
  lifetimeTitleSelected: {
    color: palette.primary,
    ...typography.fontSemiBold,
  },
  lifetimePrice: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.grey,
  },
  lifetimePriceSelected: {
    color: palette.primary,
  },
  visionPartnerContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 8,
    marginTop: 12,
  },  visionPartnerSelected: {
    borderColor: palette.secondary,
    backgroundColor: palette.onSecondary,
  },
  visionPartnerText: {
    ...typography.textBase,
    color: palette.grey,
  },
  visionPartnerTextSelected: {
    color: palette.secondary,
    ...typography.fontSemiBold,
  },
});

export default SubscriptionPurchaseScreen;
