import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, typography } from '~/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * ProgressIndicator displays the current step and total steps
 * Requirements: 4.6 - Display progress indicator showing current step and total steps
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Step counter text */}
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep ? styles.dotActive : styles.dotInactive,
              index === currentStep - 1 && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.grey,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: palette.greyLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: palette.primary,
  },
  dotInactive: {
    backgroundColor: palette.greyLight,
  },
  dotCurrent: {
    width: 24,
    borderRadius: 4,
  },
});

export default ProgressIndicator;
