import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import AppContainer from '~/components/AppContainer';
import Button from '~/components/form/Button';
import { palette, typography } from '~/theme';
import BiometricService, { BiometricType } from '~/services/BiometricService';
import PINManager from '~/services/PINManager';
import TokenManager, { ExpirationInfo } from '~/services/TokenManager';
import SecureStorageService from '~/services/SecureStorageService';
import PINSetupModal from '~/components/auth/PINSetupModal';
import { logout } from '~/store/slices/authSlice';
import { persistor } from '~/store/store';
import api from '~/store/api/api';
import { selectAuth } from '~/store/slices/authSlice';
import PushNotificationService from '~/services/PushNotificationService';

/**
 * SecuritySettingsScreen - Dedicated security settings screen
 * 
 * Requirements:
 * - 6.1: Include "Security" section with biometric, PIN, and session options
 * - 6.2: Show toggle to enable/disable biometric login when available
 * - 6.3: Show toggle to enable/disable PIN login with setup flow
 * - 6.4: Display current session expiry information
 * - 6.5: Require password confirmation when disabling biometric or PIN
 * - 6.6: Provide "Sign out of all devices" option
 * - 6.7: Invalidate all active tokens when "Sign out of all devices" is triggered
 */
const SecuritySettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isVisualPreview =
    __DEV__ &&
    Platform.OS === 'web' &&
    (globalThis as any).location?.search?.includes('preview=quick-unlock');

  // State for biometric
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<BiometricType[]>([]);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // State for PIN
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPINSetupModal, setShowPINSetupModal] = useState(false);
  const [pinSetupMode, setPinSetupMode] = useState<'setup' | 'change'>('setup');

  // State for session
  const [sessionInfo, setSessionInfo] = useState<ExpirationInfo | null>(null);

  // State for password confirmation modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalAction, setPasswordModalAction] = useState<'biometric' | 'pin' | null>(null);
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // State for sign out all devices
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Loading state
  const [initialLoading, setInitialLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setInitialLoading(true);

      // Check biometric availability
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(isVisualPreview || available);

      if (isVisualPreview || available) {
        const enabled = await BiometricService.isBiometricEnabled();
        setBiometricEnabled(isVisualPreview || enabled);

        const types = await BiometricService.getSupportedTypes();
        setBiometricTypes(isVisualPreview ? ['fingerprint'] : types);
      }

      // Check PIN status
      const pinStatus = await PINManager.isPINEnabled();
      setPinEnabled(isVisualPreview || pinStatus);

      // Get session info
      const info = await TokenManager.getExpirationInfo();
      setSessionInfo(
        isVisualPreview
          ? ({ formattedExpiry: 'Active for the next 6 days', isExpired: false } as ExpirationInfo)
          : info
      );
    } catch (error) {
      console.error('[SecuritySettings] Error loading settings:', error);
    } finally {
      setInitialLoading(false);
    }
  };


  // Get biometric display name
  const getBiometricDisplayName = useCallback((): string => {
    if (biometricTypes.includes('faceId')) {
      return 'Face ID';
    } else if (biometricTypes.includes('fingerprint')) {
      return 'Fingerprint';
    } else if (biometricTypes.includes('iris')) {
      return 'Iris';
    }
    return 'Biometric';
  }, [biometricTypes]);

  // Get biometric icon
  const getBiometricIcon = useCallback((): string => {
    if (biometricTypes.includes('faceId')) {
      return 'face-recognition';
    } else if (biometricTypes.includes('fingerprint')) {
      return 'fingerprint';
    }
    return 'shield-lock';
  }, [biometricTypes]);

  // Handle biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric
      setBiometricLoading(true);
      try {
        const userEmail = auth.user?.email || '';
        const credentials = await SecureStorageService.getCredentials();
        if (!credentials?.password) {
          Toast.show({
            type: 'error',
            text1: 'Password sign-in required',
            text2: 'Sign out and sign in with your password before enabling biometric login.',
          });
          return;
        }
        const success = await BiometricService.enableBiometric({ email: userEmail, password: credentials.password });

        if (success) {
          setBiometricEnabled(true);
          Toast.show({
            type: 'success',
            text1: `${getBiometricDisplayName()} Enabled`,
            text2: `You can now use ${getBiometricDisplayName()} to sign in`,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to Enable',
            text2: 'Could not enable biometric authentication',
          });
        }
      } catch (error) {
        console.error('[SecuritySettings] Error enabling biometric:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred while enabling biometric',
        });
      } finally {
        setBiometricLoading(false);
      }
    } else {
      // Disable biometric - requires password confirmation
      setPasswordModalAction('biometric');
      setShowPasswordModal(true);
    }
  };

  // Handle PIN toggle
  const handlePINToggle = async (value: boolean) => {
    if (value) {
      // Enable PIN - show setup modal
      setPinSetupMode('setup');
      setShowPINSetupModal(true);
    } else {
      // Disable PIN - requires password confirmation
      setPasswordModalAction('pin');
      setShowPasswordModal(true);
    }
  };

  // Handle PIN setup success
  const handlePINSetupSuccess = async () => {
    // Immediately close the modal to prevent re-triggering
    setShowPINSetupModal(false);

    // Update enabled state after a small delay to ensure modal is closed
    setTimeout(() => {
      setPinEnabled(true);
    }, 200);

    // Credentials were stored securely during password sign-in.
  };

  // Handle change PIN
  const handleChangePIN = () => {
    setPinSetupMode('change');
    setShowPINSetupModal(true);
  };

  // Verify password with backend
  const verifyPassword = async (passwordToVerify: string): Promise<boolean> => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cmdabackend-38258a63fa98.herokuapp.com';
      const response = await fetch(`${baseUrl}/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ password: passwordToVerify }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }

      // If endpoint doesn't exist, try login endpoint as fallback
      if (response.status === 404) {
        const loginResponse = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: auth.user?.email,
            password: passwordToVerify
          }),
        });

        return loginResponse.ok;
      }

      return false;
    } catch (error) {
      console.error('[SecuritySettings] Error verifying password:', error);
      return false;
    }
  };


  // Handle password confirmation
  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const isValid = await verifyPassword(password);

      if (!isValid) {
        setPasswordError('Incorrect password. Please try again.');
        setPasswordLoading(false);
        return;
      }

      // Password verified, perform the action
      if (passwordModalAction === 'biometric') {
        await BiometricService.disableBiometric();
        setBiometricEnabled(false);
        Toast.show({
          type: 'success',
          text1: `${getBiometricDisplayName()} Disabled`,
          text2: 'Biometric authentication has been disabled',
        });
      } else if (passwordModalAction === 'pin') {
        await PINManager.disablePIN();
        setPinEnabled(false);
        Toast.show({
          type: 'success',
          text1: 'PIN Disabled',
          text2: 'PIN authentication has been disabled',
        });
      }

      // Close modal and reset state
      setShowPasswordModal(false);
      setPassword('');
      setPasswordModalAction(null);
    } catch (error) {
      console.error('[SecuritySettings] Error during password confirmation:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle sign out all devices
  const handleSignOutAllDevices = () => {
    Alert.alert(
      'Sign Out All Devices',
      'This will sign you out from all devices including this one. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: performSignOutAllDevices,
        },
      ]
    );
  };

  // Perform sign out all devices
  const performSignOutAllDevices = async () => {
    setSignOutLoading(true);

    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cmdabackend-38258a63fa98.herokuapp.com';

      // Remove push token on logout
      // Requirements: 7.4 - Remove push token association on logout
      try {
        await PushNotificationService.removePushTokenOnLogout();
      } catch (error) {
        console.error('[SecuritySettings] Error removing push token:', error);
        // Continue with logout even if push token removal fails
      }

      // Call backend to invalidate all tokens
      const response = await fetch(`${baseUrl}/auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
      });

      // Clear all local credentials regardless of API response
      await SecureStorageService.clear();
      await TokenManager.clearTokens();
      await BiometricService.disableBiometric();
      await PINManager.disablePIN();

      // Clear Redux state
      dispatch(logout());
      api.util.resetApiState();
      await persistor.purge();

      Toast.show({
        type: 'success',
        text1: 'Signed Out',
        text2: 'You have been signed out from all devices',
      });

      // Navigate to splash/login
      navigation.reset({
        index: 0,
        routes: [{ name: 'splash' }],
      });
    } catch (error) {
      console.error('[SecuritySettings] Error signing out all devices:', error);

      // Still clear local data even if API fails
      await SecureStorageService.clear();
      dispatch(logout());
      api.util.resetApiState();
      await persistor.purge();

      navigation.reset({
        index: 0,
        routes: [{ name: 'splash' }],
      });
    } finally {
      setSignOutLoading(false);
    }
  };

  // Render password confirmation modal
  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Password</Text>
            <TouchableOpacity
              onPress={() => {
                setShowPasswordModal(false);
                setPassword('');
                setPasswordError(null);
              }}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={palette.greyDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Enter your password to {passwordModalAction === 'biometric' ? 'disable biometric' : 'disable PIN'} authentication
          </Text>

          <TextInput
            style={[styles.passwordInput, passwordError && styles.passwordInputError]}
            placeholder="Enter your password"
            placeholderTextColor={palette.grey}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {passwordError && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color={palette.error} />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <Button
              label="Cancel"
              variant="outlined"
              onPress={() => {
                setShowPasswordModal(false);
                setPassword('');
                setPasswordError(null);
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              label="Confirm"
              onPress={handlePasswordConfirm}
              loading={passwordLoading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );


  // Render setting item with toggle
  const renderToggleItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    loading: boolean = false,
    disabled: boolean = false,
    icon: string = 'shield-lock-outline'
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon as any} size={24} color={palette.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={palette.primary} />
      ) : (
        <Switch
          trackColor={{ false: palette.greyLight, true: palette.primary }}
          thumbColor={palette.white}
          ios_backgroundColor={palette.greyLight}
          onValueChange={onToggle}
          value={value}
          disabled={disabled}
          style={styles.switch}
        />
      )}
    </View>
  );

  // Render action item
  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: string,
    destructive: boolean = false,
    loading: boolean = false
  ) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={destructive ? palette.error : palette.primary}
        />
      </View>
      <View style={styles.actionInfo}>
        <Text style={[styles.actionTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={destructive ? palette.error : palette.primary} />
      ) : (
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={palette.grey}
        />
      )}
    </TouchableOpacity>
  );

  if (initialLoading) {
    return (
      <AppContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading security settings...</Text>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer padding={0} gap={0}>
      <View style={styles.securityHero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="shield-lock-outline" size={34} color={palette.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Security</Text>
            <Text style={styles.heroSubtitle}>Control how you unlock and protect your account.</Text>
          </View>
        </View>
        <View style={[styles.statusPill, (biometricEnabled || pinEnabled) && styles.statusPillEnabled]}>
          <View style={[styles.statusDot, (biometricEnabled || pinEnabled) && styles.statusDotEnabled]} />
          <Text style={[styles.statusPillText, (biometricEnabled || pinEnabled) && styles.statusPillTextEnabled]}>
            {biometricEnabled || pinEnabled ? 'Quick unlock on' : 'Quick unlock off'}
          </Text>
        </View>
      </View>

      <View style={styles.securityContent}>
        <Text style={styles.groupLabel}>QUICK UNLOCK</Text>
        <View style={styles.groupSurface}>
          {biometricAvailable ? (
            <>
              {renderToggleItem(
                getBiometricDisplayName(),
                `Unlock CMDA with ${getBiometricDisplayName()}`,
                biometricEnabled,
                handleBiometricToggle,
                biometricLoading,
                false,
                getBiometricIcon()
              )}
              <View style={styles.groupDivider} />
            </>
          ) : null}
          {renderToggleItem(
            'CMDA PIN',
            'Use a 4–6 digit quick-access PIN',
            pinEnabled,
            handlePINToggle,
            pinLoading,
            false,
            'dialpad'
          )}
          {pinEnabled ? (
            <>
              <View style={styles.groupDivider} />
              <TouchableOpacity style={styles.changePinButton} onPress={handleChangePIN}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={palette.primary} />
                <Text style={styles.changePinText}>Change your PIN</Text>
                <MaterialIcons name="chevron-right" size={22} color={palette.grey} />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <Text style={styles.groupLabel}>CURRENT SESSION</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <MaterialCommunityIcons name="clock-check-outline" size={24} color={palette.primary} />
          </View>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionLabel}>You’re securely signed in</Text>
            <Text style={styles.sessionText}>
              {sessionInfo?.formattedExpiry || 'Session information unavailable'}
            </Text>
            {sessionInfo && !sessionInfo.isExpired ? (
              <Text style={styles.sessionDetail}>We’ll refresh this session automatically while you use the app.</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.groupLabel}>ACCOUNT PROTECTION</Text>
        <View style={styles.groupSurface}>
          {renderActionItem(
            'Change password',
            'Update your account password',
            () => navigation.navigate('more-change-password'),
            'form-textbox-password'
          )}
          <View style={styles.groupDividerIndented} />
          {renderActionItem(
            'Sign out of all devices',
            'End every active CMDA session',
            handleSignOutAllDevices,
            'logout-variant',
            true,
            signOutLoading
          )}
        </View>

        <View style={styles.reassuranceRow}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={palette.secondary} />
          <Text style={styles.reassuranceText}>Your security preferences stay protected on this device.</Text>
        </View>
      </View>

      {/* Password Confirmation Modal */}
      {renderPasswordModal()}
      <PINSetupModal
        visible={showPINSetupModal}
        onClose={() => setShowPINSetupModal(false)}
        onSuccess={handlePINSetupSuccess}
        mode={pinSetupMode}
      />
    </AppContainer>
  );
};


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    ...typography.textBase,
    color: palette.grey,
    marginTop: 16,
  },
  securityHero: {
    backgroundColor: palette.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    ...typography.text2xl,
    ...typography.fontBold,
    color: palette.white,
  },
  heroSubtitle: {
    ...typography.textSm,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
    maxWidth: 260,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 18,
    alignSelf: 'flex-start',
    marginLeft: 72,
  },
  statusPillEnabled: {
    backgroundColor: palette.onSecondary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.white,
  },
  statusDotEnabled: {
    backgroundColor: palette.secondary,
  },
  statusPillText: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.white,
  },
  statusPillTextEnabled: {
    color: palette.secondary,
  },
  securityContent: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -14,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 30,
  },
  groupLabel: {
    ...typography.textXs,
    ...typography.fontSemiBold,
    color: palette.greyDark,
    letterSpacing: 1.2,
    marginLeft: 6,
    marginBottom: 8,
    marginTop: 8,
  },
  groupSurface: {
    backgroundColor: palette.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.greyLight,
    marginLeft: 56,
  },
  groupDividerIndented: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.greyLight,
    marginLeft: 54,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 76,
    paddingVertical: 10,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.black,
  },
  settingSubtitle: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 2,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  changePinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 10,
    paddingLeft: 56,
  },
  changePinText: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.primary,
    marginLeft: 8,
    flex: 1,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.onPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionCopy: {
    flex: 1,
  },
  sessionLabel: {
    ...typography.textBase,
    ...typography.fontSemiBold,
    color: palette.black,
  },
  sessionText: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 2,
  },
  sessionDetail: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingVertical: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.black,
  },
  actionSubtitle: {
    ...typography.textSm,
    color: palette.greyDark,
    marginTop: 2,
  },
  destructiveText: {
    color: palette.error,
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  reassuranceText: {
    ...typography.textSm,
    color: palette.secondary,
    flexShrink: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
    width: '100%',
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.greyLight,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    ...typography.textXl,
    ...typography.fontBold,
    color: palette.black,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    ...typography.textBase,
    color: palette.grey,
    marginBottom: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: palette.greyLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.textBase,
    color: palette.black,
    backgroundColor: palette.background,
  },
  passwordInputError: {
    borderColor: palette.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    ...typography.textSm,
    color: palette.error,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
});

export default SecuritySettingsScreen;
