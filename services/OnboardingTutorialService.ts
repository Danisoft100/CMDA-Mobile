import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys for tutorial persistence
 */
const TUTORIAL_STORAGE_KEYS = {
  COMPLETED: 'tutorial_completed',
  COMPLETED_AT: 'tutorial_completed_at',
  CURRENT_STEP: 'tutorial_current_step',
  SKIPPED: 'tutorial_skipped',
} as const;

/**
 * Tutorial step definition
 * Requirements: 4.4
 */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  screen: string; // Navigation route name
  tabName?: string; // Tab name if navigating to a tab screen
  highlightElement?: string; // Element to highlight on screen
  position: 'top' | 'center' | 'bottom';
  icon?: string; // Icon name for the step
}

/**
 * Tutorial steps configuration
 * Requirements: 4.4 - Include steps for: Home, Events, Resources, Payments, Profile, and Settings
 */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CMDA!',
    description: 'Let us show you around the app. This quick tour will help you discover all the features available to you.',
    screen: 'home-index',
    tabName: 'home',
    position: 'center',
    icon: 'hand-wave',
  },
  {
    id: 'home',
    title: 'Your Home Dashboard',
    description: 'This is your home screen where you can see daily devotionals, connect with members, view upcoming events, and access resources.',
    screen: 'home-index',
    tabName: 'home',
    position: 'top',
    icon: 'home',
  },
  {
    id: 'events',
    title: 'Events & Trainings',
    description: 'Browse and register for upcoming events, conferences, and training programs. Stay connected with the CMDA community.',
    screen: 'events-index',
    tabName: 'events',
    position: 'center',
    icon: 'calendar',
  },
  {
    id: 'resources',
    title: 'Resource Library',
    description: 'Access a wealth of resources including videos, articles, and educational materials to support your spiritual and professional growth.',
    screen: 'resources-index',
    tabName: 'resources',
    position: 'center',
    icon: 'youtube',
  },
  {
    id: 'payments',
    title: 'Payments & Subscriptions',
    description: 'Manage your membership subscription, make donations, and view your payment history all in one place.',
    screen: 'pay-index',
    tabName: 'payment',
    position: 'center',
    icon: 'credit-card',
  },
  {
    id: 'more',
    title: 'More Options',
    description: 'Access your profile, settings, the store, and more features from this menu.',
    screen: 'more-index',
    tabName: 'more',
    position: 'center',
    icon: 'menu',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'View and edit your profile information, update your photo, and manage your account details.',
    screen: 'more-profile',
    tabName: 'more',
    position: 'center',
    icon: 'account',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your app experience, manage security settings, and configure notifications.',
    screen: 'more-settings',
    tabName: 'more',
    position: 'center',
    icon: 'cog',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: "You've completed the tour! You can restart this tutorial anytime from Settings. Enjoy using CMDA!",
    screen: 'home-index',
    tabName: 'home',
    position: 'center',
    icon: 'check-circle',
  },
];


/**
 * OnboardingTutorialService handles tutorial state persistence and management
 * Requirements: 4.1, 4.4, 4.7, 4.8, 4.9
 */
class OnboardingTutorialService {
  private static instance: OnboardingTutorialService;

  private constructor() {}

  static getInstance(): OnboardingTutorialService {
    if (!OnboardingTutorialService.instance) {
      OnboardingTutorialService.instance = new OnboardingTutorialService();
    }
    return OnboardingTutorialService.instance;
  }

  /**
   * Get all tutorial steps
   */
  getSteps(): TutorialStep[] {
    return TUTORIAL_STEPS;
  }

  /**
   * Get a specific step by index
   */
  getStep(index: number): TutorialStep | null {
    if (index < 0 || index >= TUTORIAL_STEPS.length) {
      return null;
    }
    return TUTORIAL_STEPS[index];
  }

  /**
   * Get total number of steps
   */
  getTotalSteps(): number {
    return TUTORIAL_STEPS.length;
  }

  /**
   * Check if tutorial has been completed
   * Requirements: 4.8
   */
  async isCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEYS.COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('[OnboardingTutorialService] Error checking completion:', error);
      return false;
    }
  }

  /**
   * Check if tutorial was skipped
   */
  async wasSkipped(): Promise<boolean> {
    try {
      const skipped = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEYS.SKIPPED);
      return skipped === 'true';
    } catch (error) {
      console.error('[OnboardingTutorialService] Error checking skipped status:', error);
      return false;
    }
  }

  /**
   * Mark tutorial as completed
   * Requirements: 4.8
   */
  async markCompleted(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.COMPLETED, 'true');
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.COMPLETED_AT, new Date().toISOString());
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.CURRENT_STEP);
      console.log('[OnboardingTutorialService] Tutorial marked as completed');
      return true;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error marking completed:', error);
      return false;
    }
  }

  /**
   * Mark tutorial as skipped
   * Requirements: 4.7, 4.8
   */
  async markSkipped(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.COMPLETED, 'true');
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.SKIPPED, 'true');
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.COMPLETED_AT, new Date().toISOString());
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.CURRENT_STEP);
      console.log('[OnboardingTutorialService] Tutorial marked as skipped');
      return true;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error marking skipped:', error);
      return false;
    }
  }

  /**
   * Save current step progress
   */
  async saveCurrentStep(stepIndex: number): Promise<boolean> {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEYS.CURRENT_STEP, stepIndex.toString());
      return true;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error saving current step:', error);
      return false;
    }
  }

  /**
   * Get saved current step
   */
  async getCurrentStep(): Promise<number> {
    try {
      const step = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEYS.CURRENT_STEP);
      return step ? parseInt(step, 10) : 0;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error getting current step:', error);
      return 0;
    }
  }

  /**
   * Get completion timestamp
   */
  async getCompletedAt(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEYS.COMPLETED_AT);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error getting completion time:', error);
      return null;
    }
  }

  /**
   * Reset tutorial for restart from settings
   * Requirements: 4.9
   */
  async reset(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.COMPLETED);
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.COMPLETED_AT);
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.CURRENT_STEP);
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEYS.SKIPPED);
      console.log('[OnboardingTutorialService] Tutorial reset');
      return true;
    } catch (error) {
      console.error('[OnboardingTutorialService] Error resetting tutorial:', error);
      return false;
    }
  }

  /**
   * Check if user should see the tutorial (new user after registration)
   * Requirements: 4.1
   */
  async shouldShowTutorial(): Promise<boolean> {
    const completed = await this.isCompleted();
    return !completed;
  }
}

export default OnboardingTutorialService.getInstance();
