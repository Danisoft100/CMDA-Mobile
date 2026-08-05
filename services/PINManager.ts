import SecureStorageService, { SECURE_STORAGE_KEYS } from './SecureStorageService';

/**
 * Result of PIN setup operation
 */
export interface SetupResult {
  success: boolean;
  error?: 'PIN_MISMATCH' | 'PIN_TOO_SHORT' | 'PIN_TOO_LONG' | 'PIN_INVALID_FORMAT';
}

/**
 * Stored credentials for PIN authentication
 */
export interface PINStoredCredentials {
  email: string;
  password: string; // Store actual password for backend authentication
}

/**
 * PIN validation constants
 * Requirements: 2.1 - PIN must be 4-6 digits
 */
export const PIN_CONFIG = {
  MIN_LENGTH: 4,
  MAX_LENGTH: 6,
  MAX_FAILED_ATTEMPTS: 3,
} as const;

/**
 * PINManager handles secure PIN storage, validation, and setup for quick app access.
 * 
 * Requirements:
 * - 2.1: Require a 4-6 digit PIN entry
 * - 2.2: Require PIN confirmation during setup
 * - 2.3: Display error and clear fields on mismatch
 * - 2.4: Disable PIN login after 3 consecutive failures
 * - 2.5: Authenticate user using stored credentials on success
 * - 2.6: Store PIN using secure hashing (not plain text)
 * - 2.7: Invalidate PIN when password changes
 * - 2.8: Provide option to change or disable PIN from settings
 */
class PINManager {
  private static instance: PINManager;

  private constructor() {}

  static getInstance(): PINManager {
    if (!PINManager.instance) {
      PINManager.instance = new PINManager();
    }
    return PINManager.instance;
  }

  /**
   * Validate PIN format (4-6 digits only)
   * Requirements: 2.1
   */
  validatePINFormat(pin: string): SetupResult {
    // Check if PIN contains only digits
    if (!/^\d+$/.test(pin)) {
      return { success: false, error: 'PIN_INVALID_FORMAT' };
    }

    // Check minimum length
    if (pin.length < PIN_CONFIG.MIN_LENGTH) {
      return { success: false, error: 'PIN_TOO_SHORT' };
    }

    // Check maximum length
    if (pin.length > PIN_CONFIG.MAX_LENGTH) {
      return { success: false, error: 'PIN_TOO_LONG' };
    }

    return { success: true };
  }

  /**
   * Check if PIN is set up
   */
  async isPINEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.PIN_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('[PINManager] Error checking if PIN enabled:', error);
      return false;
    }
  }

  /**
   * Check if PIN is locked out due to failed attempts
   * Requirements: 2.4
   */
  async isLockedOut(): Promise<boolean> {
    const failedAttempts = await this.getFailedAttempts();
    return failedAttempts >= PIN_CONFIG.MAX_FAILED_ATTEMPTS;
  }

  /**
   * Set up new PIN with confirmation validation
   * Requirements: 2.1, 2.2, 2.3, 2.6
   * @param pin - The PIN to set
   * @param confirmPin - Confirmation PIN (must match)
   */
  async setupPIN(pin: string, confirmPin: string): Promise<SetupResult> {
    try {
      // Validate PIN format
      const formatValidation = this.validatePINFormat(pin);
      if (!formatValidation.success) {
        return formatValidation;
      }

      // Check if PINs match
      // Requirements: 2.2, 2.3
      if (pin !== confirmPin) {
        return { success: false, error: 'PIN_MISMATCH' };
      }

      // Hash the PIN for secure storage
      // Requirements: 2.6
      const { hash, salt } = await SecureStorageService.hashValue(pin);

      // Store the hashed PIN and salt
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_HASH, hash);
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_SALT, salt);

      // Mark PIN as enabled
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_ENABLED, 'true');

      // Reset failed attempts
      await this.resetFailedAttempts();

      return { success: true };
    } catch (error) {
      console.error('[PINManager] Error setting up PIN:', error);
      return { success: false, error: 'PIN_INVALID_FORMAT' };
    }
  }


  /**
   * Validate PIN and return stored credentials
   * Requirements: 2.4, 2.5
   * @param pin - The PIN to validate
   */
  async validatePIN(pin: string): Promise<PINStoredCredentials | null> {
    try {
      // Check if locked out
      if (await this.isLockedOut()) {
        return null;
      }

      // Check if PIN is enabled
      const enabled = await this.isPINEnabled();
      if (!enabled) {
        return null;
      }

      // Get stored hash and salt
      const storedHash = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.PIN_HASH);
      const storedSalt = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.PIN_SALT);

      if (!storedHash || !storedSalt) {
        return null;
      }

      // Verify the PIN against stored hash
      const isValid = await SecureStorageService.verifyHash(pin, storedHash, storedSalt);

      if (!isValid) {
        // Increment failed attempts
        await this.incrementFailedAttempts();

        // Check if now locked out
        if (await this.isLockedOut()) {
          // Disable PIN on lockout
          await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_ENABLED, 'false');
        }

        return null;
      }

      // Reset failed attempts on success
      await this.resetFailedAttempts();

      // Retrieve stored credentials
      const credentials = await SecureStorageService.getCredentials();

      if (!credentials) {
        return null;
      }

      return {
        email: credentials.email,
        password: credentials.password, // Return actual password for backend auth
      };
    } catch (error) {
      console.error('[PINManager] Error validating PIN:', error);
      await this.incrementFailedAttempts();
      return null;
    }
  }

  /**
   * Change existing PIN
   * Requirements: 2.8
   * @param currentPin - Current PIN for verification
   * @param newPin - New PIN to set
   * @param confirmPin - Confirmation of new PIN
   */
  async changePIN(
    currentPin: string,
    newPin: string,
    confirmPin: string
  ): Promise<SetupResult> {
    try {
      // First verify the current PIN
      const storedHash = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.PIN_HASH);
      const storedSalt = await SecureStorageService.getItem(SECURE_STORAGE_KEYS.PIN_SALT);

      if (!storedHash || !storedSalt) {
        return { success: false, error: 'PIN_INVALID_FORMAT' };
      }

      const isCurrentValid = await SecureStorageService.verifyHash(
        currentPin,
        storedHash,
        storedSalt
      );

      if (!isCurrentValid) {
        return { success: false, error: 'PIN_MISMATCH' };
      }

      // Validate new PIN format
      const formatValidation = this.validatePINFormat(newPin);
      if (!formatValidation.success) {
        return formatValidation;
      }

      // Check if new PINs match
      if (newPin !== confirmPin) {
        return { success: false, error: 'PIN_MISMATCH' };
      }

      // Hash and store the new PIN
      const { hash, salt } = await SecureStorageService.hashValue(newPin);
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_HASH, hash);
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_SALT, salt);

      return { success: true };
    } catch (error) {
      console.error('[PINManager] Error changing PIN:', error);
      return { success: false, error: 'PIN_INVALID_FORMAT' };
    }
  }

  /**
   * Disable PIN (requires password confirmation handled by caller)
   * Requirements: 2.8
   */
  async disablePIN(): Promise<void> {
    try {
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.PIN_HASH);
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.PIN_SALT);
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.PIN_ENABLED);
      await this.resetFailedAttempts();
    } catch (error) {
      console.error('[PINManager] Error disabling PIN:', error);
    }
  }

  /**
   * Get the number of failed PIN attempts
   */
  async getFailedAttempts(): Promise<number> {
    try {
      const attempts = await SecureStorageService.getItem(
        SECURE_STORAGE_KEYS.PIN_FAILED_ATTEMPTS
      );
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('[PINManager] Error getting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Reset failed attempts counter
   */
  async resetFailedAttempts(): Promise<void> {
    try {
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_FAILED_ATTEMPTS, '0');
    } catch (error) {
      console.error('[PINManager] Error resetting failed attempts:', error);
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
        SECURE_STORAGE_KEYS.PIN_FAILED_ATTEMPTS,
        newCount.toString()
      );
    } catch (error) {
      console.error('[PINManager] Error incrementing failed attempts:', error);
    }
  }

  /**
   * Invalidate PIN when password changes
   * Requirements: 2.7
   */
  async invalidatePIN(): Promise<void> {
    try {
      // Remove PIN data but keep the enabled flag as false
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.PIN_HASH);
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.PIN_SALT);
      await SecureStorageService.setItem(SECURE_STORAGE_KEYS.PIN_ENABLED, 'false');
      await this.resetFailedAttempts();
    } catch (error) {
      console.error('[PINManager] Error invalidating PIN:', error);
    }
  }

  /**
   * Store credentials for PIN authentication
   * This should be called after successful password login
   * @param email - User's email
   * @param password - User's password (will be encrypted)
   */
  async storeCredentials(email: string, password: string): Promise<boolean> {
    try {
      return await SecureStorageService.storeCredentials(email, password);
    } catch (error) {
      console.error('[PINManager] Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Get remaining attempts before lockout
   */
  async getRemainingAttempts(): Promise<number> {
    const failed = await this.getFailedAttempts();
    return Math.max(0, PIN_CONFIG.MAX_FAILED_ATTEMPTS - failed);
  }

  /**
   * Get error message for setup result
   */
  getErrorMessage(error: SetupResult['error']): string {
    switch (error) {
      case 'PIN_MISMATCH':
        return 'PINs do not match. Please try again.';
      case 'PIN_TOO_SHORT':
        return `PIN must be at least ${PIN_CONFIG.MIN_LENGTH} digits.`;
      case 'PIN_TOO_LONG':
        return `PIN must be at most ${PIN_CONFIG.MAX_LENGTH} digits.`;
      case 'PIN_INVALID_FORMAT':
        return 'PIN must contain only numbers.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default PINManager.getInstance();
