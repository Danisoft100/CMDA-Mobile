import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, typography } from '~/theme';
import PINManager, { PIN_CONFIG, SetupResult } from '~/services/PINManager';
import Toast from 'react-native-toast-message';

interface PINSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'setup' | 'change';
}

/**
 * PINSetupModal - Modal for setting up or changing PIN
 * 
 * Requirements:
 * - 2.1: Require a 4-6 digit PIN entry
 * - 2.2: Require PIN confirmation during setup
 * - 2.3: Display error and clear fields on mismatch
 */
const PINSetupModal: React.FC<PINSetupModalProps> = ({
  visible,
  onClose,
  onSuccess,
  mode = 'setup',
}) => {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('new');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setStep(mode === 'change' ? 'current' : 'new');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
    }
  }, [visible, mode]);

  // Get current PIN value based on step
  const getCurrentPinValue = useCallback((): string => {
    switch (step) {
      case 'current':
        return currentPin;
      case 'new':
        return newPin;
      case 'confirm':
        return confirmPin;
      default:
        return '';
    }
  }, [step, currentPin, newPin, confirmPin]);

  // Get title based on step
  const getTitle = useCallback((): string => {
    switch (step) {
      case 'current':
        return 'Enter Current PIN';
      case 'new':
        return mode === 'change' ? 'Enter New PIN' : 'Create Your PIN';
      case 'confirm':
        return 'Confirm Your PIN';
      default:
        return '';
    }
  }, [step, mode]);

  // Get subtitle based on step
  const getSubtitle = useCallback((): string => {
    switch (step) {
      case 'current':
        return 'Enter your current PIN to continue';
      case 'new':
        return `Enter a ${PIN_CONFIG.MIN_LENGTH}-${PIN_CONFIG.MAX_LENGTH} digit PIN`;
      case 'confirm':
        return 'Re-enter your PIN to confirm';
      default:
        return '';
    }
  }, [step]);

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
    const currentValue = getCurrentPinValue();
    
    if (currentValue.length < PIN_CONFIG.MAX_LENGTH) {
      switch (step) {
        case 'current':
          setCurrentPin(prev => prev + num);
          break;
        case 'new':
          setNewPin(prev => prev + num);
          break;
        case 'confirm':
          setConfirmPin(prev => prev + num);
          break;
      }
    }
  }, [step, getCurrentPinValue]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    setError(null);
    switch (step) {
      case 'current':
        setCurrentPin(prev => prev.slice(0, -1));
        break;
      case 'new':
        setNewPin(prev => prev.slice(0, -1));
        break;
      case 'confirm':
        setConfirmPin(prev => prev.slice(0, -1));
        break;
    }
  }, [step]);


  // Handle submit
  const handleSubmit = useCallback(async () => {
    const currentValue = getCurrentPinValue();
    
    // Validate PIN length
    if (currentValue.length < PIN_CONFIG.MIN_LENGTH) {
      setError(`PIN must be at least ${PIN_CONFIG.MIN_LENGTH} digits`);
      triggerShake();
      return;
    }

    // Handle step transitions
    if (step === 'current') {
      // Verify current PIN for change mode
      setLoading(true);
      const credentials = await PINManager.validatePIN(currentPin);
      setLoading(false);
      
      if (!credentials) {
        setError('Incorrect PIN. Please try again.');
        triggerShake();
        setCurrentPin('');
        return;
      }
      
      setStep('new');
      return;
    }

    if (step === 'new') {
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      // Check if PINs match
      if (newPin !== confirmPin) {
        setError('PINs do not match. Please try again.');
        triggerShake();
        setConfirmPin('');
        return;
      }

      // Setup or change PIN
      setLoading(true);
      let result: SetupResult;
      
      if (mode === 'change') {
        result = await PINManager.changePIN(currentPin, newPin, confirmPin);
      } else {
        result = await PINManager.setupPIN(newPin, confirmPin);
      }
      
      setLoading(false);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: mode === 'change' ? 'PIN Changed' : 'PIN Created',
          text2: mode === 'change' 
            ? 'Your PIN has been changed successfully' 
            : 'Your PIN has been set up successfully',
        });
        onSuccess();
        onClose();
      } else {
        setError(PINManager.getErrorMessage(result.error));
        triggerShake();
        setConfirmPin('');
      }
    }
  }, [step, currentPin, newPin, confirmPin, mode, getCurrentPinValue, triggerShake, onSuccess, onClose]);

  // Auto-submit when PIN reaches max length
  React.useEffect(() => {
    const currentValue = getCurrentPinValue();
    if (currentValue.length === PIN_CONFIG.MAX_LENGTH && !loading) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPin, newPin, confirmPin, getCurrentPinValue, handleSubmit, loading]);

  // Handle back
  const handleBack = useCallback(() => {
    setError(null);
    if (step === 'confirm') {
      setStep('new');
      setConfirmPin('');
    } else if (step === 'new' && mode === 'change') {
      setStep('current');
      setNewPin('');
    } else {
      onClose();
    }
  }, [step, mode, onClose]);

  // Render PIN dots
  const renderPINDots = () => {
    const currentValue = getCurrentPinValue();
    const dots = [];
    
    for (let i = 0; i < PIN_CONFIG.MAX_LENGTH; i++) {
      const isFilled = i < currentValue.length;
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
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={`empty-${itemIndex}`} style={styles.numberButton} />;
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
                  disabled={loading}
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={palette.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={palette.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
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
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginTop: 16,
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
});

export default PINSetupModal;
