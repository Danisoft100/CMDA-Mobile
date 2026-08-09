import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import {
    INCOME_BRACKETS,
    GLOBAL_INCOME_BASED_PRICING,
    LIFETIME_MEMBERSHIPS
} from "~/constants/payments";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import { useInitSubscriptionSessionMutation } from "~/store/api/paymentsApi";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";

interface GlobalSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

const GlobalSubscriptionModal = ({ visible, onClose, navigation }: GlobalSubscriptionModalProps) => {
    const { user } = useSelector(selectAuth);

    const [selectedIncomeBracket, setSelectedIncomeBracket] = useState<string>(
        user?.incomeBracket || INCOME_BRACKETS[0].value
    );
    const [selectedTab, setSelectedTab] = useState<'subscriptions' | 'lifetime'>('subscriptions');
    const [selectedLifetimePlan, setSelectedLifetimePlan] = useState<string>('gold');

    const [initSubscription, { isLoading }] = useInitSubscriptionSessionMutation();

    const getSelectedPricing = () => {
        return GLOBAL_INCOME_BASED_PRICING[selectedIncomeBracket as keyof typeof GLOBAL_INCOME_BASED_PRICING];
    };

    const handleSubscribe = () => {
        const isLifetime = selectedTab === 'lifetime';
        const pricing = getSelectedPricing();

        if (!pricing && !isLifetime) return;

        let amount = 0;
        let subscriptionData: any;

        if (isLifetime) {
            const lifetimePlan = LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS];
            amount = lifetimePlan.price;
            subscriptionData = { selectedTab: 'lifetime', lifetimeType: selectedLifetimePlan };
        } else if (pricing) {
            amount = pricing.annual;
            subscriptionData = { selectedTab: 'regular', incomeBracket: selectedIncomeBracket };
        }

        const confirmMessage = isLifetime
            ? `Subscribe to ${LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS]?.label} for ${formatCurrency(amount, 'USD')}?`
            : `Subscribe annually for ${formatCurrency(amount, 'USD')}?`;

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
                                onClose(); // Close modal before navigating

                                if (data.checkout_url) {
                                    navigation.navigate("pay-init", {
                                        paymentFor: "subscription",
                                        checkoutUrl: data.checkout_url
                                    });
                                } else {
                                    const checkApprove = (link: { rel: string; href: string }) => link.rel === "approve" || link.rel === "approval_url";
                                    const approvalUrl = data.links?.find(checkApprove)?.href || data.approvalUrl;

                                    if (approvalUrl) {
                                        navigation.navigate("pay-init", {
                                            paymentFor: "subscription",
                                            checkoutUrl: approvalUrl,
                                            source: "PAYPAL"
                                        });
                                    } else {
                                        Alert.alert("Error", "No payment link returned. Please try again or contact support.");
                                    }
                                }
                            })
                            .catch((error) => {
                                console.error("Subscription error:", error);
                                const errorMessage = error?.data?.message || error?.message || "Failed to initialize subscription.";
                                Alert.alert("Error", errorMessage);
                            });
                    }
                }
            ]
        );
    };

    const pricing = getSelectedPricing();
    const currentPrice = selectedTab === 'lifetime'
        ? LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS]?.price
        : pricing ? pricing.annual : 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MCIcon name="close" size={24} color={palette.greyDark} />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <MCIcon name="card-account-details-outline" size={32} color={palette.primary} />
                            </View>
                            <Text style={[typography.textLg, typography.fontBold, { textAlign: 'center', marginTop: 12 }]}>
                                Choose Membership Plan
                            </Text>
                            <Text style={[typography.textSm, { textAlign: 'center', color: palette.grey, marginTop: 4, paddingHorizontal: 20 }]}>
                                Select the plan that best fits your income level and commitment
                            </Text>
                        </View>
                    </View>

                    {/* Tab Navigation */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'subscriptions' && styles.activeTab]}
                            onPress={() => setSelectedTab('subscriptions')}
                        >
                            <MCIcon
                                name="card-outline"
                                size={20}
                                color={selectedTab === 'subscriptions' ? palette.primary : palette.grey}
                            />
                            <Text style={[
                                styles.tabText,
                                selectedTab === 'subscriptions' && styles.activeTabText
                            ]}>Annual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'lifetime' && styles.activeTab]}
                            onPress={() => setSelectedTab('lifetime')}
                        >
                            <MCIcon
                                name="star-outline"
                                size={20}
                                color={selectedTab === 'lifetime' ? palette.primary : palette.grey}
                            />
                            <Text style={[
                                styles.tabText,
                                selectedTab === 'lifetime' && styles.activeTabText
                            ]}>Lifetime</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {selectedTab === 'subscriptions' ? (
                            <View style={styles.section}>
                                {/* Income Bracket */}
                                <Text style={[typography.textSm, typography.fontSemiBold, { marginBottom: 8 }]}>
                                    Annual Income Level
                                </Text>
                                <View style={styles.dropdownContainer}>
                                    {INCOME_BRACKETS.map((bracket) => (
                                        <TouchableOpacity
                                            key={bracket.value}
                                            style={[
                                                styles.bracketOption,
                                                selectedIncomeBracket === bracket.value && styles.bracketOptionSelected
                                            ]}
                                            onPress={() => setSelectedIncomeBracket(bracket.value)}
                                        >
                                            <Text style={[
                                                typography.textSm,
                                                selectedIncomeBracket === bracket.value && { color: palette.primary, fontWeight: '600' }
                                            ]}>
                                                {bracket.label}
                                            </Text>
                                            {selectedIncomeBracket === bracket.value && (
                                                <MCIcon name="check-circle" size={16} color={palette.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Frequency */}
                                <Text style={[typography.textSm, typography.fontSemiBold, { marginBottom: 8, marginTop: 16 }]}>
                                    Payment Frequency
                                </Text>
                                <View style={styles.frequencyContainer}>
                                    <View style={[styles.freqButton, styles.freqButtonSelected]}>
                                        <Text style={[styles.freqText, styles.freqTextSelected]}>Annual</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.section}>
                                <View style={styles.lifetimeBanner}>
                                    <Text style={[typography.textSm, typography.fontMedium, { color: '#854D0E', textAlign: 'center' }]}>
                                        Make a one-time investment in your CMDA membership
                                    </Text>
                                </View>

                                <Text style={[typography.textSm, typography.fontSemiBold, { marginBottom: 8 }]}>
                                    Lifetime Plan
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
                                        <View>
                                            <Text style={[
                                                typography.textSm,
                                                selectedLifetimePlan === key && { color: palette.primary, fontWeight: '600' }
                                            ]}>
                                                {membership.label}
                                            </Text>
                                            <Text style={[typography.textXs, { color: palette.grey }]}>
                                                {formatCurrency(membership.price, "USD")}
                                            </Text>
                                        </View>
                                        {selectedLifetimePlan === key && (
                                            <MCIcon name="check-circle" size={16} color={palette.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Price Display */}
                        <View style={styles.priceContainer}>
                            <Text style={[typography.textSm, typography.fontSemiBold, { color: palette.primary }]}>
                                {selectedTab === 'subscriptions'
                                    ? GLOBAL_INCOME_BASED_PRICING[selectedIncomeBracket as keyof typeof GLOBAL_INCOME_BASED_PRICING]?.label
                                    : LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS]?.label}
                            </Text>
                            <Text style={[typography.text3xl, typography.fontBold, { color: palette.primary, marginVertical: 4 }]}>
                                {formatCurrency(currentPrice, "USD")}
                            </Text>
                            <Text style={[typography.textXs, { color: palette.grey }]}>
                                {selectedTab === 'subscriptions' ? 'annual payment' : `${LIFETIME_MEMBERSHIPS[selectedLifetimePlan as keyof typeof LIFETIME_MEMBERSHIPS]?.years} Years Coverage`}
                            </Text>
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            label={selectedTab === 'lifetime' ? "Purchase Lifetime" : "Subscribe"}
                            onPress={handleSubscribe}
                            loading={isLoading}
                            style={{ backgroundColor: palette.primary }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: palette.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: palette.greyLight,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
        padding: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.onPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: palette.greyLight,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: palette.primary,
    },
    tabText: {
        ...typography.textSm,
        color: palette.grey,
        fontWeight: '500',
    },
    activeTabText: {
        color: palette.primary,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: palette.greyLight,
        borderRadius: 8,
        overflow: 'hidden',
    },
    bracketOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.greyLight,
    },
    bracketOptionSelected: {
        backgroundColor: palette.onPrimary,
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    freqButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: palette.greyLight,
        borderRadius: 8,
        alignItems: 'center',
    },
    freqButtonSelected: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
    },
    freqText: {
        ...typography.textSm,
        color: palette.greyDark,
    },
    freqTextSelected: {
        color: palette.white,
        fontWeight: '600',
    },
    lifetimeBanner: {
        backgroundColor: '#FEF9C3', // yellow-50
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    lifetimeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: palette.greyLight,
        borderRadius: 8,
        marginBottom: 8,
    },
    lifetimeOptionSelected: {
        borderColor: palette.primary,
        backgroundColor: palette.onPrimary,
    },
    priceContainer: {
        backgroundColor: palette.onPrimary,
        borderWidth: 1,
        borderColor: palette.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    visionPartnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: palette.greyLight,
        borderRadius: 8,
        marginBottom: 16,
    },
    visionPartnerSelected: {
        borderColor: palette.secondary,
        backgroundColor: palette.onSecondary,
    },
    visionPartnerText: {
        ...typography.textSm,
        color: palette.grey,
        flex: 1,
    },
    visionPartnerTextSelected: {
        color: palette.secondary,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: palette.greyLight,
    }
});

export default GlobalSubscriptionModal;
