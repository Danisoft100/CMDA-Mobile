import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * Storage keys used by the SecureStorageService
 */
export const SECURE_STORAGE_KEYS = {
  BIOMETRIC_CREDENTIALS: 'biometric_credentials',
  PIN_HASH: 'pin_hash',
  PIN_SALT: 'pin_salt',
  BIOMETRIC_TOKEN: 'biometric_token',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  PIN_ENABLED: 'pin_enabled',
  BIOMETRIC_FAILED_ATTEMPTS: 'biometric_failed_attempts',
  PIN_FAILED_ATTEMPTS: 'pin_failed_attempts',
  TOKEN_DATA: 'token_data',
  TOKEN_EXPIRY: 'token_expiry',
  USER_EMAIL: 'user_email',
} as const;

export type SecureStorageKey = typeof SECURE_STORAGE_KEYS[keyof typeof SECURE_STORAGE_KEYS];

/**
 * Options for secure storage operations
 */
interface SecureStoreOptions {
  keychainAccessible?: SecureStore.SecureStoreOptions['keychainAccessible'];
  requireAuthentication?: boolean;
}

/**
 * SecureStorageService provides encrypted key-value storage for sensitive data
 * using expo-secure-store. It handles credentials, PINs, and tokens securely.
 * 
 * Requirements: 1.6, 2.6
 */
class SecureStorageService {
  private static instance: SecureStorageService;
  private isAvailable: boolean = true;

  private constructor() {
    this.checkAvailability();
  }

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Check if secure storage is available on this device
   */
  private async checkAvailability(): Promise<void> {
    try {
      // SecureStore is available on iOS and Android, but not web
      this.isAvailable = Platform.OS !== 'web';
      if (!this.isAvailable) {
        console.warn('[SecureStorageService] Secure storage not available on web platform');
      }
    } catch (error) {
      console.error('[SecureStorageService] Error checking availability:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Store a value securely
   * @param key - The key to store the value under
   * @param value - The value to store (will be stringified if object)
   * @param options - Optional secure store options
   */
  async setItem(
    key: SecureStorageKey | string,
    value: string | object,
    options?: SecureStoreOptions
  ): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('[SecureStorageService] Secure storage not available');
      return false;
    }

    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      const storeOptions: SecureStore.SecureStoreOptions = {
        keychainAccessible: options?.keychainAccessible || SecureStore.WHEN_UNLOCKED,
        requireAuthentication: options?.requireAuthentication || false,
      };

      await SecureStore.setItemAsync(key, stringValue, storeOptions);
      return true;
    } catch (error) {
      console.error(`[SecureStorageService] Error storing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value from secure storage
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  async getItem(key: SecureStorageKey | string): Promise<string | null> {
    if (!this.isAvailable) {
      console.warn('[SecureStorageService] Secure storage not available');
      return null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorageService] Error retrieving item ${key}:`, error);
      return null;
    }
  }

  /**
   * Retrieve and parse a JSON value from secure storage
   * @param key - The key to retrieve
   * @returns The parsed object or null if not found/invalid
   */
  async getItemParsed<T>(key: SecureStorageKey | string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[SecureStorageService] Error parsing item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   * @param key - The key to remove
   */
  async removeItem(key: SecureStorageKey | string): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('[SecureStorageService] Secure storage not available');
      return false;
    }

    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`[SecureStorageService] Error removing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all secure storage items used by this app
   * Note: This only clears known keys, not all secure storage
   */
  async clear(): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('[SecureStorageService] Secure storage not available');
      return false;
    }

    try {
      const keys = Object.values(SECURE_STORAGE_KEYS);
      await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      console.log('[SecureStorageService] All secure storage cleared');
      return true;
    } catch (error) {
      console.error('[SecureStorageService] Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Generate a cryptographic hash of a value (for PIN storage)
   * @param value - The value to hash
   * @param salt - Optional salt (will be generated if not provided)
   * @returns Object containing the hash and salt
   */
  async hashValue(value: string, salt?: string): Promise<{ hash: string; salt: string }> {
    try {
      // Generate salt if not provided
      const useSalt = salt || await this.generateSalt();
      
      // Combine value with salt
      const saltedValue = value + useSalt;
      
      // Generate SHA-256 hash
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        saltedValue
      );

      return { hash, salt: useSalt };
    } catch (error) {
      console.error('[SecureStorageService] Error hashing value:', error);
      throw error;
    }
  }

  /**
   * Verify a value against a stored hash
   * @param value - The value to verify
   * @param storedHash - The stored hash to compare against
   * @param salt - The salt used when creating the hash
   * @returns True if the value matches the hash
   */
  async verifyHash(value: string, storedHash: string, salt: string): Promise<boolean> {
    try {
      const { hash } = await this.hashValue(value, salt);
      return hash === storedHash;
    } catch (error) {
      console.error('[SecureStorageService] Error verifying hash:', error);
      return false;
    }
  }

  /**
   * Generate a random salt for hashing
   */
  async generateSalt(): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(16);
      return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('[SecureStorageService] Error generating salt:', error);
      // Fallback to timestamp-based salt (less secure but functional)
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  }

  /**
   * Store encrypted credentials for biometric/PIN authentication
   * @param email - User's email
   * @param token - Authentication token
   */
  async storeCredentials(email: string, token: string): Promise<boolean> {
    try {
      const credentials = { email, token, storedAt: Date.now() };
      return await this.setItem(
        SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
        credentials,
        { keychainAccessible: SecureStore.WHEN_UNLOCKED }
      );
    } catch (error) {
      console.error('[SecureStorageService] Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getCredentials(): Promise<{ email: string; token: string; storedAt: number } | null> {
    return await this.getItemParsed(SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
  }

  /**
   * Clear all authentication-related data (for logout)
   */
  async clearAuthData(): Promise<boolean> {
    try {
      const authKeys = [
        SECURE_STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
        SECURE_STORAGE_KEYS.BIOMETRIC_TOKEN,
        SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED,
        SECURE_STORAGE_KEYS.BIOMETRIC_FAILED_ATTEMPTS,
        SECURE_STORAGE_KEYS.PIN_HASH,
        SECURE_STORAGE_KEYS.PIN_SALT,
        SECURE_STORAGE_KEYS.PIN_ENABLED,
        SECURE_STORAGE_KEYS.PIN_FAILED_ATTEMPTS,
        SECURE_STORAGE_KEYS.TOKEN_DATA,
        SECURE_STORAGE_KEYS.TOKEN_EXPIRY,
        SECURE_STORAGE_KEYS.USER_EMAIL,
      ];

      await Promise.all(authKeys.map(key => this.removeItem(key)));
      console.log('[SecureStorageService] Auth data cleared');
      return true;
    } catch (error) {
      console.error('[SecureStorageService] Error clearing auth data:', error);
      return false;
    }
  }
}

export default SecureStorageService.getInstance();
