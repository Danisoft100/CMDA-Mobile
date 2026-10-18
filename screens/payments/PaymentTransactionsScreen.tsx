import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import AppContainer from "~/components/AppContainer";
import { PaymentIntents } from "~/components/payments";
import { palette } from "~/theme";
import Button from "~/components/form/Button";
import PaymentRecovery from "~/components/payments/PaymentRecovery";

/**
 * PaymentTransactionsScreen - Shows all payment transactions with requery functionality
 * Similar to the frontend PaymentIntents component
 */
const PaymentTransactionsScreen = () => {
  const [recovery, setRecovery] = useState(false);
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", gap: 8, padding: 16 }}>
        <Button
          label="Transactions"
          variant={recovery ? "outlined" : "filled"}
          style={{ flex: 1 }}
          onPress={() => setRecovery(false)}
        />
        <Button
          label="Earlier payments"
          variant={recovery ? "filled" : "outlined"}
          style={{ flex: 1 }}
          onPress={() => setRecovery(true)}
        />
      </View>
      <AppContainer withScrollView={recovery}>
        {recovery ? (
          <PaymentRecovery />
        ) : (
          <PaymentIntents showTitle={true} compact={false} />
        )}
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
