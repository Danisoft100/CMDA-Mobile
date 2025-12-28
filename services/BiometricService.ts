import * as LocalAuthentication from 'expo-local-authentication';
import SecureStorageService, { SECURE_STORAGE_KEYS } from './SecureStorageService';

/**
 * Biometric types supported by the device
 */
export type BiometricType = 'fingerprint' | 'faceId' | 'iris';

/**
 * Stored credentials for biometric authentication
 */
export interface StoredCredentials {
  email: string;
  password: string; // Store actual password for backend authentication
}

/**
 * Biometric authentication result
 */
interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Maximum failed attempts before lockout
 * Requirements: 1.3 - Disable biometric login after 3 consecutive failures
 */
const MAX_FAILED_ATTEMPTS = 3;

/**
 * BiometricService handles fingerprint, Face ID, and other biometric authentication
 * methods using device hardware via expo-local-authentication.
 * 
 * Requirements:
 * - 1.1: Prompt for biometric verification on app launch when enabled
 * - 1.2: Retrieve stored credentials and authenticate automatically on success
 * - 1.3: Disable biometric login after 3 consecutive failures
 * - 1.5: Hide biometric options if hardware not available
 * - 1.7: Support both fingerprint and Face ID based on device capabilities
 */
class BiometricService {
  private static instance: BiometricService;

  private constructor() {}

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric hardware is available on the device
   * Requirements: 1.5
   */
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.log('[BiometricService] No biometric hardware available');
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('[BiometricService] Biometric not enrolled on device');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[BiometricService] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types (fingerprint, faceId, iris)
   * Requirements: 1.7
   */
  async getSupportedTypes(): Promise<BiometricType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometricTypes: BiometricType[] = [];

      for (const type of types) {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            biometricTypes.push('fingerprint');
            break;
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            biometricTypes.push('faceId');
            break;
          case LocalAuthentication.AuthenticationType.IRIS:
            biometricTypes.push('iris');
            break;
        }
      }

      console.log('[BiometricService] Supported types:', biometricTypes);
      return biometricTypes;
    } catch (error) {
      console.error('[BiometricService] Error getting supported types:', error);
      return [];
    }
  }

  /**
   * Get human-readable names for biometric types
   */
  getBiometricTypeNames(types: BiometricType[]): string[] {
    return types.map(type => {
      switch (type) {
        case 'fingerprint':
          return 'Fingerprint';
        case 'faceId':
          return 'Face ID';
        case 'iris':
          return 'Iris';
        default:
          return 'Biometric';
      }
    });
  }

  /**
   * Check if biometric login is enabled for this user
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('[BiometricService] Error checking if enabled:', error);
      return false;
    }
  }

  /**
   * Check if biometric is locked out due to failed attempts
   * Requirements: 1.3
   */
  async isLockedOut(): Promise<boolean> {
    const failedAttempts = await this.getFailedAttempts();
    return failedAttempts >= MAX_FAILED_ATTEMPTS;
  }

  /**
   * Enable biometric login by storing encrypted credentials
   * Requirements: 1.6
   * @param credentials - User credentials to store
   */
  async enableBiometric(credentials: { email: string; password: string }): Promise<boolean> {
    try {
      // First verify biometric is available
      const available = await this.isAvailable();
      if (!available) {
        console.log('[BiometricService] Cannot enable - biometric not available');
        return false;
      }

      // Authenticate user before enabling
      const authResult = await this.authenticate('Verify your identity to enable biometric login');
      if (!authResult.success) {
        console.log('[BiometricService] Cannot enable - authentication failed');
        return false;
      }

      // Store credentials securely (email and password for backend authentication)
      const storedCredentials: StoredCredentials = {
        email: credentials.email,
        password: credentials.password, // Store actual password for backend auth
      };

      await SecureStorageService.setItem(
        SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
        storedCredentials
      );

      // Mark biometric as enabled
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');

      // Reset failed attempts
      await this.resetFailedAttempts();

      console.log('[BiometricService] Biometric enabled successfully');
      return true;
    } catch (error) {
      console.error('[BiometricService] Error enabling biometric:', error);
      return false;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED);
      await this.resetFailedAttempts();
      console.log('[BiometricService] Biometric disabled');
    } catch (error) {
      console.error('[BiometricService] Error disabling biometric:', error);
    }
  }

  /**
   * Perform biometric authentication and return stored credentials
   * Requirements: 1.1, 1.2, 1.3
   */
  async biometricLogin(): Promise<StoredCredentials | null> {
    try {
      // Check if locked out
      if (await this.isLockedOut()) {
        console.log('[BiometricService] Biometric is locked out');
        return null;
      }

      // Check if biometric is enabled
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        console.log('[BiometricService] Biometric is not enabled');
        return null;
      }

      // Perform biometric authentication
      const authResult = await this.authenticate('Login with biometric');
      
      if (!authResult.success) {
        // Increment failed attempts
        await this.incrementFailedAttempts();
        
        // Check if now locked out
        if (await this.isLockedOut()) {
          console.log('[BiometricService] Biometric locked out after failed attempts');
          // Disable biometric on lockout
          await SecureStorageService.setItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
        }
        
        return null;
      }

      // Reset failed attempts on success
      await this.resetFailedAttempts();

      // Retrieve stored credentials
      const credentials = await SecureStorageService.getItemParsed<StoredCredentials>(
        SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS
      );

      if (!credentials) {
        console.log('[BiometricService] No stored credentials found');
        return null;
      }

      console.log('[BiometricService] Biometric login successful');
      return credentials;
    } catch (error) {
      console.error('[BiometricService] Error during biometric login:', error);
      await this.incrementFailedAttempts();
      return null;
    }
  }

  /**
   * Get the number of failed authentication attempts
   */
  async getFailedAttempts(): Promise<number> {
    try {
      const attempts = await SecureStorageService.getItem(
        SECURE_STORAGE_KEYS.BIOMETRIC_FAILED_ATTEMPTS
      );
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('[BiometricService] Error getting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Reset failed attempts counter (after successful password login)
   */
  async resetFailedAttempts(): Promise<void> {
    try {
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.BIOMETRIC_FAILED_ATTEMPTS, '0');
      console.log('[BiometricService] Failed attempts reset');
    } catch (error) {
      console.error('[BiometricService] Error resetting failed attempts:', error);
    }
  }

  /**
   * Increment failed attempts counter
   */
  private async incrementFailedAttempts(): Promise<void> {
    try {
      const current = await this.getFailedAttempts();
      const newCount = current + 1;
      await SecureStorageService.setItem(
        SECURE_STORAGE_KEYS.BIOMETRIC_FAILED_ATTEMPTS,
        newCount.toString()
      );
      console.log(`[BiometricService] Failed attempts: ${newCount}/${MAX_FAILED_ATTEMPTS}`);
    } catch (error) {
      console.error('[BiometricService] Error incrementing failed attempts:', error);
    }
  }

  /**
   * Perform biometric authentication with the device
   */
  private async authenticate(promptMessage: string): Promise<BiometricAuthResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        return { success: true };
      }

      // Handle different error types
      let errorMessage = 'Authentication failed';
      if (result.error === 'user_cancel') {
        errorMessage = 'Authentication cancelled';
      } else if (result.error === 'lockout') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'No biometric enrolled on device';
      }

      console.log('[BiometricService] Authentication failed:', result.error);
      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('[BiometricService] Authentication error:', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  /**
   * Get the security level of biometric authentication
   */
  async getSecurityLevel(): Promise<LocalAuthentication.SecurityLevel> {
    try {
      return await LocalAuthentication.getEnrolledLevelAsync();
    } catch (error) {
      console.error('[BiometricService] Error getting security level:', error);
      return LocalAuthentication.SecurityLevel.NONE;
    }
  }

  /**
   * Check if device has strong biometric security
   */
  async hasStrongBiometric(): Promise<boolean> {
    const level = await this.getSecurityLevel();
    return level === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;
  }
}

export default BiometricService.getInstance();

// Export the max failed attempts constant for testing
export { MAX_FAILED_ATTEMPTS };
