import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStorageService, { SECURE_STORAGE_KEYS } from './SecureStorageService';

const TOKEN_BACKUP_KEY = '@cmda_token_backup';
const HAS_SIGNED_IN_KEY = '@cmda_has_signed_in';

/**
 * Token expiration configuration
 * Requirements: 3.1 - JWT tokens expire after 7 days of inactivity
 */
const TOKEN_CONFIG = {
  /** Token validity period in milliseconds (7 days) */
  EXPIRY_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  /** Refresh window in milliseconds (24 hours before expiry) */
  REFRESH_WINDOW_MS: 24 * 60 * 60 * 1000,
};

/**
 * Token data structure stored in secure storage
 */
interface TokenData {
  token: string;
  refreshToken: string;
  issuedAt: number;
  expiresAt: number;
  email?: string;
}

/**
 * Expiration info for display in settings
 */
export interface ExpirationInfo {
  expiresAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  isExpired: boolean;
  needsRefresh: boolean;
  formattedExpiry: string;
}

/**
 * TokenManager handles JWT token lifecycle, expiration, and refresh logic.
 * 
 * Requirements:
 * - 3.1: Configure JWT tokens to expire after 7 days of inactivity
 * - 3.2: Auto-refresh token when within 24 hours of expiration
 * - 3.5: Store token expiration date and display "Session expires in X days"
 */
class TokenManager {
  private static instance: TokenManager;
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cmdabackend-38258a63fa98.herokuapp.com';
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store a new token with expiration tracking
   * @param token - The JWT token to store
   * @param expiresIn - Optional expiration time in seconds (defaults to 7 days)
   * @param email - Optional user email to associate with token
   */
  async storeTokens(params: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt?: string | Date;
    email?: string;
  }): Promise<boolean> {
    try {
      const now = Date.now();
      const parsedExpiry = params.accessTokenExpiresAt
        ? new Date(params.accessTokenExpiresAt).getTime()
        : NaN;

      const tokenData: TokenData = {
        token: params.accessToken,
        refreshToken: params.refreshToken,
        issuedAt: now,
        expiresAt: Number.isFinite(parsedExpiry)
          ? parsedExpiry
          : now + TOKEN_CONFIG.EXPIRY_DURATION_MS,
        email: params.email,
      };

      this.tokenData = tokenData;

      // Store token data securely + AsyncStorage backup (survives SecureStore cold-start issues)
      const success = await SecureStorageService.setItem(
        SECURE_STORAGE_KEYS.TOKEN_DATA,
        tokenData
      );
      try {
        await AsyncStorage.setItem(TOKEN_BACKUP_KEY, JSON.stringify(tokenData));
        await AsyncStorage.setItem(HAS_SIGNED_IN_KEY, 'true');
      } catch (e) {
        console.warn('[TokenManager] Failed to write token backup:', e);
      }

      if (success) {
      }

      return success || true; // backup may still allow restore
    } catch (error) {
      console.error('[TokenManager] Error storing token:', error);
      return false;
    }
  }

  /**
   * Get the current token if valid
   * @returns The token string or null if expired/not found
   */
  async getToken(): Promise<string | null> {
    try {
      // Check memory cache first
      if (this.tokenData && !this.isTokenExpired(this.tokenData)) {
        return this.tokenData.token;
      }

      const storedData = await this.getTokenData();

      if (!storedData) {
        return null;
      }

      // Access token still valid
      if (!this.isTokenExpired(storedData)) {
        return storedData.token;
      }

      // Access token expired — refresh using stored refresh token
      return await this.refreshToken();
    } catch (error) {
      console.error('[TokenManager] Error getting token:', error);
      return null;
    }
  }

  /**
   * Check if the token needs refresh (within 24 hours of expiry)
   * Requirements: 3.2
   */
  async needsRefresh(): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return false;

      const now = Date.now();
      const timeUntilExpiry = tokenData.expiresAt - now;

      // Needs refresh if within 24 hours of expiry
      return timeUntilExpiry > 0 && timeUntilExpiry <= TOKEN_CONFIG.REFRESH_WINDOW_MS;
    } catch (error) {
      console.error('[TokenManager] Error checking refresh status:', error);
      return false;
    }
  }

  /**
   * Refresh the token by calling the backend API
   * Requirements: 3.2
   * @returns The new token or null if refresh failed
   */
  async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method to perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      const currentData = await this.getTokenData();
      if (!currentData?.refreshToken) {
        await this.clearTokens();
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${this.apiBaseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentData.refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[TokenManager] Token refresh failed:', response.status);
        
        // If unauthorized, clear tokens
        if (response.status === 401) {
          await this.clearTokens();
        }
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.data?.accessToken && data.data?.refreshToken) {
        const newToken = data.data.accessToken;

        await this.storeTokens({
          accessToken: newToken,
          refreshToken: data.data.refreshToken,
          accessTokenExpiresAt: data.data.accessTokenExpiresAt,
          email: currentData.email,
        });
        return newToken;
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[TokenManager] Token refresh timed out');
      } else {
        console.error('[TokenManager] Error refreshing token:', error);
      }
      return null;
    }
  }

  /**
   * Get expiration info for display in settings
   * Requirements: 3.5
   */
  async getExpirationInfo(): Promise<ExpirationInfo | null> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return null;

      const now = Date.now();
      const expiresAt = new Date(tokenData.expiresAt);
      const timeRemaining = tokenData.expiresAt - now;
      const isExpired = timeRemaining <= 0;
      const needsRefresh = !isExpired && timeRemaining <= TOKEN_CONFIG.REFRESH_WINDOW_MS;

      // Calculate remaining time
      const totalMinutes = Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
      const totalHours = Math.floor(totalMinutes / 60);
      const daysRemaining = Math.floor(totalHours / 24);
      const hoursRemaining = totalHours % 24;
      const minutesRemaining = totalMinutes % 60;

      // Format expiry string
      let formattedExpiry: string;
      if (isExpired) {
        formattedExpiry = 'Session expired';
      } else if (daysRemaining > 0) {
        formattedExpiry = `Session expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
      } else if (hoursRemaining > 0) {
        formattedExpiry = `Session expires in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
      } else {
        formattedExpiry = `Session expires in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
      }

      return {
        expiresAt,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        isExpired,
        needsRefresh,
        formattedExpiry,
      };
    } catch (error) {
      console.error('[TokenManager] Error getting expiration info:', error);
      return null;
    }
  }

  /**
   * Check if the token is expired
   */
  async isExpired(): Promise<boolean> {
    const tokenData = await this.getTokenData();
    if (!tokenData) return true;
    return this.isTokenExpired(tokenData);
  }

  /**
   * Clear all tokens (for logout)
   * Requirements: 3.4
   */
  async clearTokens(): Promise<boolean> {
    try {
      this.tokenData = null;
      await SecureStorageService.removeItem(SECURE_STORAGE_KEYS.TOKEN_DATA);
      try {
        await AsyncStorage.removeItem(TOKEN_BACKUP_KEY);
      } catch (_) { console.error('[TokenManager] Failed to remove backup token from AsyncStorage:', _); }
      return true;
    } catch (error) {
      console.error('[TokenManager] Error clearing tokens:', error);
      return false;
    }
  }

  /**
   * Get the stored email associated with the token
   */
  async getStoredEmail(): Promise<string | null> {
    const tokenData = await this.getTokenData();
    if (tokenData?.email) return tokenData.email;

    // Session expiry clears tokens, but quick unlock intentionally remains available.
    const credentials = await SecureStorageService.getCredentials();
    return credentials?.email || null;
  }

  /** Whether this installation has previously completed a successful sign-in. */
  async hasSignedInBefore(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(HAS_SIGNED_IN_KEY)) === 'true';
    } catch (error) {
      console.warn('[TokenManager] Failed to read sign-in history:', error);
      return false;
    }
  }

  /**
   * Update the stored email
   */
  async updateStoredEmail(email: string): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      if (!tokenData) return false;

      tokenData.email = email;
      this.tokenData = tokenData;

      return await SecureStorageService.setItem(
        SECURE_STORAGE_KEYS.TOKEN_DATA,
        tokenData
      );
    } catch (error) {
      console.error('[TokenManager] Error updating email:', error);
      return false;
    }
  }

  /**
   * Check if user has a valid session
   */
  async hasValidSession(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Get raw token data from storage
   */
  private async getTokenData(): Promise<TokenData | null> {
    if (this.tokenData) {
      return this.tokenData;
    }

    let storedData = await SecureStorageService.getItemParsed<TokenData>(
      SECURE_STORAGE_KEYS.TOKEN_DATA
    );

    // Fallback to AsyncStorage backup if SecureStore is empty/unavailable
    if (!storedData) {
      try {
        const backup = await AsyncStorage.getItem(TOKEN_BACKUP_KEY);
        if (backup) {
          storedData = JSON.parse(backup) as TokenData;
          // Re-hydrate SecureStore when possible
          await SecureStorageService.setItem(SECURE_STORAGE_KEYS.TOKEN_DATA, storedData);
        }
      } catch (e) {
        console.warn('[TokenManager] Token backup read failed:', e);
      }
    }

    if (storedData) {
      this.tokenData = storedData;
    }

    return storedData;
  }

  /**
   * Check if token data represents an expired token
   */
  private isTokenExpired(tokenData: TokenData): boolean {
    return Date.now() >= tokenData.expiresAt;
  }

  /**
   * Auto-refresh token if needed (call this periodically or on app resume)
   * Requirements: 3.2
   */
  async autoRefreshIfNeeded(): Promise<void> {
    try {
      const needsRefresh = await this.needsRefresh();
      if (needsRefresh) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('[TokenManager] Auto-refresh error:', error);
    }
  }
}

export default TokenManager.getInstance();

// Export the config for testing purposes
export { TOKEN_CONFIG };
