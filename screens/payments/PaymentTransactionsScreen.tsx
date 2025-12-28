import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppContainer from '~/components/AppContainer';
import { PaymentIntents } from '~/components/payments';
import { palette } from '~/theme';

/**
 * PaymentTransactionsScreen - Shows all payment transactions with requery functionality
 * Similar to the frontend PaymentIntents component
 */
const PaymentTransactionsScreen = () => {
  return (
    <View style={styles.container}>
      <AppContainer withScrollView={false}>
        <PaymentIntents showTitle={true} compact={false} />
      </AppContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
});

export default PaymentTransactionsScreen;
