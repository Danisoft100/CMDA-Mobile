import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import MCIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { palette, typography } from '~/theme';
import { useTutorial } from '~/contexts/TutorialContext';
import ProgressIndicator from '~/components/tutorial/ProgressIndicator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * TutorialOverlay component displays the tutorial modal with step content
 * Requirements: 4.5, 4.6
 */
const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    previousStep,
    skip,
    complete,
  } = useTutorial();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animate in when step changes
  useEffect(() => {
    if (isActive) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, currentStepIndex]);

  if (!isActive || !currentStep) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      complete();
    } else {
      nextStep();
    }
  };

  const getIconName = (iconName?: string): string => {
    const iconMap: Record<string, string> = {
      'hand-wave': 'hand-wave',
      'home': 'home',
      'calendar': 'calendar',
      'youtube': 'youtube',
      'credit-card': 'credit-card',
      'menu': 'menu',
      'account': 'account',
      'cog': 'cog',
      'check-circle': 'check-circle',
    };
    return iconMap[iconName || ''] || 'information';
  };


  return (
    <Modal
      visible={isActive}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Skip button */}
            {!isLastStep && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}

            {/* Icon */}
            <View style={styles.iconContainer}>
              <MCIcon
                name={getIconName(currentStep.icon) as any}
                size={48}
                color={palette.primary}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentStep.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentStep.description}</Text>

            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStepIndex + 1}
              totalSteps={totalSteps}
            />

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {!isFirstStep && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={previousStep}
                  activeOpacity={0.7}
                >
                  <MCIcon name="chevron-left" size={20} color={palette.primary} />
                  <Text style={styles.secondaryButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  isFirstStep && styles.fullWidthButton,
                ]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
                {!isLastStep && (
                  <MCIcon name="chevron-right" size={20} color={palette.white} />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  skipText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.grey,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.text2xl,
    ...typography.fontBold,
    color: palette.primaryContainer,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...typography.textBase,
    ...typography.fontNormal,
    color: palette.greyDark,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  secondaryButton: {
    backgroundColor: palette.onPrimary,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryButtonText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.white,
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.primary,
    marginHorizontal: 4,
  },
});

export default TutorialOverlay;
