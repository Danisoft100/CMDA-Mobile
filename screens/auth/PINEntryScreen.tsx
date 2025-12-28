import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, typography } from '~/theme';
import AppKeyboardAvoidingView from '~/components/AppKeyboardAvoidingView';
import AppLogo from '~/components/AppLogo';
import { PIN_CONFIG } from '~/services/PINManager';

/**
 * PIN entry mode
 */
export type PINMode = 'login' | 'setup' | 'confirm' | 'change' | 'verify';

interface PINEntryScreenProps {
  navigation: any;
  route: {
    params?: {
      mode?: PINMode;
      onSuccess?: (pin: string) => void;
      onCancel?: () => void;
      title?: string;
      subtitle?: string;
    };
  };
}

/**
 * PINEntryScreen - A screen for entering, setting up, and verifying PINs
 * 
 * Requirements:
 * - 2.1: Require a 4-6 digit PIN entry
 * - 2.2: Require PIN confirmation during setup
 * - 2.3: Display error and clear fields on mismatch
 */
const PINEntryScreen: React.FC<PINEntryScreenProps> = ({ navigation, route }) => {
  const {
    mode = 'login',
    onSuccess,
    onCancel,
    title: customTitle,
    subtitle: customSubtitle,
  } = route.params || {};

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeAnimation] = useState(new Animated.Value(0));

  // Get title based on mode
  const getTitle = useCallback((): string => {
    if (customTitle) return customTitle;
    
    switch (mode) {
      case 'setup':
        return isConfirmStep ? 'Confirm Your PIN' : 'Create Your PIN';
      case 'change':
        return isConfirmStep ? 'Confirm New PIN' : 'Enter New PIN';
      case 'verify':
        return 'Verify Your PIN';
      case 'login':
      default:
        return 'Enter Your PIN';
    }
  }, [mode, isConfirmStep, customTitle]);

  // Get subtitle based on mode
  const getSubtitle = useCallback((): string => {
    if (customSubtitle) return customSubtitle;
    
    switch (mode) {
      case 'setup':
        return isConfirmStep 
          ? 'Re-enter your PIN to confirm' 
          : `Enter a ${PIN_CONFIG.MIN_LENGTH}-${PIN_CONFIG.MAX_LENGTH} digit PIN`;
      case 'change':
        return isConfirmStep 
          ? 'Re-enter your new PIN to confirm' 
          : `Enter a new ${PIN_CONFIG.MIN_LENGTH}-${PIN_CONFIG.MAX_LENGTH} digit PIN`;
      case 'verify':
        return 'Enter your current PIN to continue';
      case 'login':
      default:
        return 'Enter your PIN to sign in';
    }
  }, [mode, isConfirmStep, customSubtitle]);

  // Shake animation for errors
  const triggerShake = useCallback(() => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  // Handle number press
  const handleNumberPress = useCallback((num: string) => {
    setError(null);
    
    if (isConfirmStep) {
      if (confirmPin.length < PIN_CONFIG.MAX_LENGTH) {
        setConfirmPin(prev => prev + num);
      }
    } else {
      if (pin.length < PIN_CONFIG.MAX_LENGTH) {
        setPin(prev => prev + num);
      }
    }
  }, [pin, confirmPin, isConfirmStep]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    setError(null);
    
    if (isConfirmStep) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  }, [isConfirmStep]);

  // Handle clear
  const handleClear = useCallback(() => {
    setError(null);
    if (isConfirmStep) {
      setConfirmPin('');
    } else {
      setPin('');
    }
  }, [isConfirmStep]);


  // Handle PIN submission
  const handleSubmit = useCallback(() => {
    const currentPin = isConfirmStep ? confirmPin : pin;
    
    // Validate PIN length
    if (currentPin.length < PIN_CONFIG.MIN_LENGTH) {
      setError(`PIN must be at least ${PIN_CONFIG.MIN_LENGTH} digits`);
      triggerShake();
      return;
    }

    // Handle setup/change mode confirmation step
    if ((mode === 'setup' || mode === 'change') && !isConfirmStep) {
      setIsConfirmStep(true);
      return;
    }

    // Handle confirmation step - check if PINs match
    if (isConfirmStep) {
      if (pin !== confirmPin) {
        setError('PINs do not match. Please try again.');
        triggerShake();
        setConfirmPin('');
        return;
      }
    }

    // Call success callback with the PIN
    if (onSuccess) {
      onSuccess(pin);
    }
  }, [pin, confirmPin, isConfirmStep, mode, onSuccess, triggerShake]);

  // Auto-submit when PIN reaches max length
  useEffect(() => {
    const currentPin = isConfirmStep ? confirmPin : pin;
    if (currentPin.length === PIN_CONFIG.MAX_LENGTH) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        handleSubmit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pin, confirmPin, isConfirmStep, handleSubmit]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  }, [navigation, onCancel]);

  // Handle going back from confirm step
  const handleBack = useCallback(() => {
    if (isConfirmStep) {
      setIsConfirmStep(false);
      setConfirmPin('');
      setError(null);
    } else {
      handleCancel();
    }
  }, [isConfirmStep, handleCancel]);

  // Render PIN dots
  const renderPINDots = () => {
    const currentPin = isConfirmStep ? confirmPin : pin;
    const dots = [];
    
    for (let i = 0; i < PIN_CONFIG.MAX_LENGTH; i++) {
      const isFilled = i < currentPin.length;
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            isFilled && styles.pinDotFilled,
            error && styles.pinDotError,
          ]}
        />
      );
    }
    
    return (
      <Animated.View 
        style={[
          styles.pinDotsContainer,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        {dots}
      </Animated.View>
    );
  };

  // Render number pad
  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['clear', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item) => {
              if (item === 'clear') {
                return (
                  <TouchableOpacity
                    key={item}
                    style={styles.numberButton}
                    onPress={handleClear}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                );
              }
              
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={item}
                    style={styles.numberButton}
                    onPress={handleBackspace}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="backspace" size={24} color={palette.greyDark} />
                  </TouchableOpacity>
                );
              }
              
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.numberText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <AppKeyboardAvoidingView gap={20}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={palette.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <AppLogo />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      {renderPINDots()}

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={16} color={palette.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderNumberPad()}

      <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>
          {mode === 'login' ? 'Use Password Instead' : 'Cancel'}
        </Text>
      </TouchableOpacity>
    </AppKeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.textXl,
    ...typography.fontBold,
    color: palette.black,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.textBase,
    color: palette.grey,
    textAlign: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.greyLight,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  pinDotError: {
    borderColor: palette.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    ...typography.textSm,
    color: palette.error,
    marginLeft: 4,
  },
  numberPad: {
    alignItems: 'center',
    marginBottom: 24,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.greyLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  numberText: {
    ...typography.textXl,
    ...typography.fontSemiBold,
    color: palette.black,
    fontSize: 28,
  },
  clearText: {
    ...typography.textSm,
    ...typography.fontMedium,
    color: palette.greyDark,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.primary,
  },
});

export default PINEntryScreen;
