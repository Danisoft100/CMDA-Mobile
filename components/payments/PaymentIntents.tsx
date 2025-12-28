import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { palette, typography } from '~/theme';
import { formatCurrency } from '~/utils/currencyFormatter';
import { formatDate } from '~/utils/dateFormatter';
import {
  useGetMyPaymentIntentsQuery,
  useRequeryPaymentIntentsMutation,
} from '~/store/api/paymentsApi';

interface PaymentIntent {
  _id: string;
  intentCode: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'ABANDONED';
  context: 'DONATION' | 'SUBSCRIPTION' | 'ORDER' | 'EVENT';
  provider: string;
  providerReference?: string;
  createdAt: string;
}

interface PaymentIntentsProps {
  showTitle?: boolean;
  compact?: boolean;
  onRefresh?: () => void;
  onViewAll?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESSFUL':
      return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
    case 'PENDING':
      return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' };
    case 'PROCESSING':
      return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
    case 'FAILED':
      return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
    case 'ABANDONED':
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  }
};

const getContextLabel = (context: string) => {
  switch (context) {
    case 'DONATION':
      return 'Donation';
    case 'SUBSCRIPTION':
      return 'Subscription';
    case 'ORDER':
      return 'Order';
    case 'EVENT':
      return 'Event/Conference';
    default:
      return context;
  }
};

const getContextIcon = (context: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (context) {
    case 'DONATION':
      return 'hand-heart';
    case 'SUBSCRIPTION':
      return 'card-account-details';
    case 'ORDER':
      return 'shopping';
    case 'EVENT':
      return 'calendar-star';
    default:
      return 'cash';
  }
};

const PaymentIntents: React.FC<PaymentIntentsProps> = ({
  showTitle = true,
  compact = false,
  onRefresh,
  onViewAll,
}) => {
  const [requeryingIntents, setRequeryingIntents] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetMyPaymentIntentsQuery(
    { page: 1, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );
  const [requeryPaymentIntents] = useRequeryPaymentIntentsMutation();

  const paymentIntents: PaymentIntent[] = data?.items || [];

  // Filter to show only pending/failed transactions
  const requiresAttention = paymentIntents.filter(
    (intent) =>
      intent.status === 'PENDING' ||
      intent.status === 'FAILED' ||
      intent.status === 'PROCESSING'
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    onRefresh?.();
    setRefreshing(false);
  };

  const handleRequery = async (intent: PaymentIntent) => {
    if (requeryingIntents.includes(intent._id)) return;

    setRequeryingIntents((prev) => [...prev, intent._id]);

    try {
      const result = await requeryPaymentIntents({
        intentId: intent._id,
      }).unwrap();

      const outcome = result?.data?.[0];
      if (outcome?.providerStatus === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Payment Verified',
          text2: 'Payment verified and synced successfully!',
        });
        refetch();
      } else if (outcome?.error) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: outcome.error,
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Payment Status',
          text2: `Status: ${outcome?.providerStatus || 'No update available'}`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.data?.message || 'Unable to verify payment',
      });
    } finally {
      setRequeryingIntents((prev) => prev.filter((id) => id !== intent._id));
    }
  };

  const handleRequeryAll = async () => {
    if (requiresAttention.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Pending Payments',
        text2: 'No pending payments to verify',
      });
      return;
    }

    Toast.show({
      type: 'info',
      text1: 'Verifying Payments',
      text2: `Checking ${requiresAttention.length} payment(s)...`,
    });

    for (const intent of requiresAttention) {
      await handleRequery(intent);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={palette.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  if (requiresAttention.length === 0 && compact) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactContent}>
          <MaterialIcons name="info-outline" size={20} color="#1e40af" />
          <Text style={styles.compactText}>
            {requiresAttention.length} payment(s) pending verification
          </Text>
        </View>
        <View style={styles.compactActions}>
          {onViewAll && (
            <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.compactButton}
            onPress={handleRequeryAll}
            disabled={requeryingIntents.length > 0}
          >
            {requeryingIntents.length > 0 ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : (
              <Text style={styles.compactButtonText}>Verify All</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Payment Transactions</Text>
            <Text style={styles.subtitle}>
              {requiresAttention.length > 0
                ? `${requiresAttention.length} payment(s) need verification`
                : 'All payments verified'}
            </Text>
          </View>
          {requiresAttention.length > 0 && (
            <TouchableOpacity
              style={styles.verifyAllButton}
              onPress={handleRequeryAll}
              disabled={requeryingIntents.length > 0}
            >
              {requeryingIntents.length > 0 ? (
                <ActivityIndicator size="small" color={palette.primary} />
              ) : (
                <Text style={styles.verifyAllText}>Verify All</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {paymentIntents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-remove" size={48} color={palette.grey} />
            <Text style={styles.emptyText}>No payment transactions found</Text>
          </View>
        ) : (
          paymentIntents.map((intent) => {
            const needsRequery = ['PENDING', 'FAILED', 'PROCESSING'].includes(intent.status);
            const isRequerying = requeryingIntents.includes(intent._id);
            const statusColors = getStatusColor(intent.status);

            return (
              <View
                key={intent._id}
                style={[
                  styles.intentCard,
                  needsRequery && styles.intentCardPending,
                ]}
              >
                <View style={styles.intentHeader}>
                  <View style={styles.intentContext}>
                    <MaterialCommunityIcons
                      name={getContextIcon(intent.context)}
                      size={20}
                      color={palette.primary}
                    />
                    <Text style={styles.contextLabel}>
                      {getContextLabel(intent.context)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors.bg, borderColor: statusColors.border },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {intent.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.intentDetails}>
                  <Text style={styles.amountText}>
                    {formatCurrency(intent.amount, intent.currency)}
                  </Text>
                  <Text style={styles.codeText}>Code: {intent.intentCode}</Text>
                  {intent.providerReference && (
                    <Text style={styles.refText}>
                      Ref: {intent.providerReference.substring(0, 16)}...
                    </Text>
                  )}
                  <Text style={styles.dateText}>
                    {formatDate(intent.createdAt).date} {formatDate(intent.createdAt).time}
                  </Text>
                </View>

                <View style={styles.intentActions}>
                  {needsRequery ? (
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        intent.status === 'FAILED' && styles.verifyButtonDanger,
                      ]}
                      onPress={() => handleRequery(intent)}
                      disabled={isRequerying}
                    >
                      {isRequerying ? (
                        <ActivityIndicator size="small" color={palette.onPrimary} />
                      ) : (
                        <>
                          <MaterialIcons name="refresh" size={16} color={palette.onPrimary} />
                          <Text style={styles.verifyButtonText}>Verify</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.textSm,
    color: palette.grey,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.greyLight,
  },
  title: {
    ...typography.textLg,
    ...typography.fontSemiBold,
    color: palette.black,
  },
  subtitle: {
    ...typography.textSm,
    color: palette.grey,
    marginTop: 2,
  },
  verifyAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 8,
  },
  verifyAllText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.primary,
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    ...typography.textBase,
    color: palette.grey,
    marginTop: 12,
  },
  intentCard: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
  intentCardPending: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  intentContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextLabel: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    ...typography.textXs,
    ...typography.fontMedium,
  },
  intentDetails: {
    marginBottom: 12,
  },
  amountText: {
    ...typography.textLg,
    ...typography.fontBold,
    color: palette.black,
    marginBottom: 4,
  },
  codeText: {
    ...typography.textSm,
    color: palette.greyDark,
  },
  refText: {
    ...typography.textXs,
    color: palette.grey,
    marginTop: 2,
  },
  dateText: {
    ...typography.textXs,
    color: palette.grey,
    marginTop: 4,
  },
  intentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifyButtonDanger: {
    backgroundColor: '#dc2626',
  },
  verifyButtonText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.onPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: '#16a34a',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  compactText: {
    ...typography.textSm,
    color: '#1e40af',
  },
  compactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 6,
  },
  compactButtonText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.primary,
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  viewAllText: {
    ...typography.textSm,
    color: '#1e40af',
    textDecorationLine: 'underline',
  },
});

export default PaymentIntents;
