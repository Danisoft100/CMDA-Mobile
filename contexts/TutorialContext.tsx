import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import OnboardingTutorialService, { TutorialStep, TUTORIAL_STEPS } from '~/services/OnboardingTutorialService';
import { navigate, navigationRef } from '~/utils/navigationService';

/**
 * Tutorial context state interface
 */
interface TutorialContextState {
  // State
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  totalSteps: number;
  isCompleted: boolean;
  isLoading: boolean;
  
  // Actions
  start: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => Promise<void>;
  goToStep: (index: number) => void;
}

const TutorialContext = createContext<TutorialContextState | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
  navigation?: any;
}

/**
 * TutorialProvider manages the tutorial state and navigation
 * Requirements: 4.1, 4.4, 4.7, 4.8, 4.9
 */
export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children, navigation }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalSteps = TUTORIAL_STEPS.length;
  const currentStep = TUTORIAL_STEPS[currentStepIndex] || null;

  // Check completion status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const completed = await OnboardingTutorialService.isCompleted();
        setIsCompleted(completed);
        
        if (!completed) {
          const savedStep = await OnboardingTutorialService.getCurrentStep();
          setCurrentStepIndex(savedStep);
        }
      } catch (error) {
        console.error('[TutorialContext] Error checking status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, []);

  // Save current step when it changes
  useEffect(() => {
    if (isActive && currentStepIndex >= 0) {
      OnboardingTutorialService.saveCurrentStep(currentStepIndex);
    }
  }, [currentStepIndex, isActive]);

  // Navigate to the screen for the current step
  // Requirements: 4.3 - Navigate to actual screens on each step
  useEffect(() => {
    if (isActive && currentStep && navigationRef.isReady()) {
      const { tabName, screen } = currentStep;
      
      // Small delay to allow modal animation to complete
      const timer = setTimeout(() => {
        try {
          if (tabName) {
            // Navigate to tab first, then to the specific screen within that tab
            navigate('tab', { screen: tabName, params: { screen } });
          } else {
            navigate(screen);
          }
          console.log(`[TutorialContext] Navigated to ${screen} (tab: ${tabName})`);
        } catch (error) {
          console.error('[TutorialContext] Navigation error:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isActive, currentStepIndex, currentStep]);


  /**
   * Start the tutorial
   * Requirements: 4.1
   */
  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
    setIsCompleted(false);
  }, []);

  /**
   * Move to next step
   * Requirements: 4.3
   */
  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    } else {
      // Last step - complete the tutorial
      complete();
    }
  }, [currentStepIndex, totalSteps]);

  /**
   * Move to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
    }
  }, [currentStepIndex, totalSteps]);

  /**
   * Go to a specific step
   */
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  }, [totalSteps]);

  /**
   * Skip tutorial with confirmation
   * Requirements: 4.7
   */
  const skip = useCallback(() => {
    Alert.alert(
      'Skip Tutorial?',
      'Are you sure you want to skip the tutorial? You can restart it anytime from Settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            await OnboardingTutorialService.markSkipped();
            setIsActive(false);
            setIsCompleted(true);
          },
        },
      ]
    );
  }, []);

  /**
   * Complete the tutorial
   * Requirements: 4.8
   */
  const complete = useCallback(async () => {
    await OnboardingTutorialService.markCompleted();
    setIsActive(false);
    setIsCompleted(true);
  }, []);

  /**
   * Reset tutorial for restart
   * Requirements: 4.9
   */
  const reset = useCallback(async () => {
    await OnboardingTutorialService.reset();
    setCurrentStepIndex(0);
    setIsCompleted(false);
  }, []);

  const value: TutorialContextState = {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    isCompleted,
    isLoading,
    start,
    nextStep,
    previousStep,
    skip,
    complete,
    reset,
    goToStep,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

/**
 * Hook to access tutorial context
 */
export const useTutorial = (): TutorialContextState => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export default TutorialContext;
