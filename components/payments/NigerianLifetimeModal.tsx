import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { NIGERIAN_LIFETIME_MEMBERSHIP } from "~/constants/payments";
import { formatCurrency } from "~/utils/currencyFormatter";
import Button from "~/components/form/Button";
import { useInitSubscriptionSessionMutation } from "~/store/api/paymentsApi";

interface NigerianLifetimeModalProps {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

const NigerianLifetimeModal = ({ visible, onClose, navigation }: NigerianLifetimeModalProps) => {
    const [confirmed, setConfirmed] = useState(false);
    const [initSubscription, { isLoading }] = useInitSubscriptionSessionMutation();

    const handleSubscribe = () => {
        const subscriptionData = {
            isNigerianLifetime: true,
            amount: NIGERIAN_LIFETIME_MEMBERSHIP.lifetime.price,
            currency: 'NGN',
            frequency: 'lifetime',
            paymentFrequency: 'lifetime'
        };

        Alert.alert(
            "Confirm Lifetime Membership",
            `Pay ${formatCurrency(NIGERIAN_LIFETIME_MEMBERSHIP.lifetime.price, "NGN")} for a lifetime membership?`,
            [
                { text: "Cancel" },
                {
                    text: "Proceed",
                    onPress: () => {
                        initSubscription(subscriptionData)
                            .unwrap()
                            .then((data) => {
                                onClose();

                                if (data.checkout_url) {
                                    navigation.navigate("pay-init", {
                                        paymentFor: "subscription",
                                        checkoutUrl: data.checkout_url
                                    });
                                } else {
                                    const checkApprove = (link: { rel: string; href: string }) => link.rel === "approve" || link.rel === "approval_url" || link.rel === "authorization_url";
                                    const approvalUrl = data.links?.find(checkApprove)?.href || data.approvalUrl || data.data?.authorization_url; // Handle Paystack structure

                                    if (approvalUrl) {
                                        navigation.navigate("pay-init", {
                                            paymentFor: "subscription",
                                            checkoutUrl: approvalUrl,
                                            source: "PAYSTACK" // Assuming Paystack for NGN
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
                                <MCIcon name="check-circle" size={32} color={palette.primary} />
                            </View>
                            <Text style={[typography.textLg, typography.fontBold, { textAlign: 'center', marginTop: 12 }]}>
                                {NIGERIAN_LIFETIME_MEMBERSHIP.lifetime.label}
                            </Text>
                            <Text style={[typography.textSm, { textAlign: 'center', color: palette.grey, marginTop: 4 }]}>
                                Secure your CMDA membership for life!
                            </Text>
                        </View>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        <View style={styles.priceContainer}>
                            <Text style={[typography.textSm, typography.fontMedium, { color: palette.greyDark }]}>
                                One-Time Payment
                            </Text>
                            <Text style={[typography.text3xl, typography.fontBold, { color: palette.primary, marginVertical: 8 }]}>
                                {formatCurrency(NIGERIAN_LIFETIME_MEMBERSHIP.lifetime.price, "NGN")}
                            </Text>
                            <Text style={[typography.textSm, { color: palette.grey }]}>
                                Valid for Lifetime
                            </Text>
                        </View>

                        <View style={styles.benefitsContainer}>
                            <Text style={[typography.textBase, typography.fontSemiBold, { marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]}>
                                <MCIcon name="information" size={20} color={palette.primary} /> Lifetime Membership Benefits:
                            </Text>
                            {[
                                "Access to all CMDA events and conferences for life",
                                "No annual renewal required",
                                "Full access to CMDA resources and network",
                                "Priority support and exclusive benefits",
                                "Save money compared to annual subscriptions"
                            ].map((benefit, index) => (
                                <View key={index} style={styles.benefitItem}>
                                    <MCIcon name="check-circle" size={20} color={palette.success} />
                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.agreementContainer}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setConfirmed(!confirmed)}
                            >
                                <MCIcon
                                    name={confirmed ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color={confirmed ? palette.primary : palette.grey}
                                />
                                <Text style={[typography.textSm, { flex: 1, marginLeft: 8 }]}>
                                    I understand that this is a one-time payment of {formatCurrency(NIGERIAN_LIFETIME_MEMBERSHIP.lifetime.price, "NGN")} for a lifetime membership.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            label="Proceed to Payment"
                            onPress={handleSubscribe}
                            loading={isLoading}
                            disabled={!confirmed}
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
        height: '85%',
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    header: {
        padding: 16,
        alignItems: 'center',
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
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: palette.onPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scrollContent: {
        padding: 20,
    },
    priceContainer: {
        backgroundColor: palette.onPrimary, // Light purple bg
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    benefitsContainer: {
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    benefitText: {
        ...typography.textSm,
        marginLeft: 12,
        flex: 1,
        color: palette.greyDark,
    },
    agreementContainer: {
        backgroundColor: '#EFF6FF', // blue-50 equivalent
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE', // blue-200
        marginBottom: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: palette.greyLight,
    }
});

export default NigerianLifetimeModal;
