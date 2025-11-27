import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingData } from '../types/onboarding';
import {
  getOnboardingData,
  saveOnboardingData as saveOnboardingDataToStorage,
  markOnboardingComplete as markCompleteInStorage,
  isOnboardingComplete as checkCompletionInStorage,
} from '../lib/onboarding';

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => Promise<void>;
  saveOnboardingData: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  isComplete: boolean;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding data on mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await getOnboardingData();
      const complete = await checkCompletionInStorage();
      setOnboardingData(data);
      setIsComplete(complete);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingData = async (data: Partial<OnboardingData>) => {
    try {
      const updatedData = { ...onboardingData, ...data };
      setOnboardingData(updatedData);
      await saveOnboardingDataToStorage(data);
    } catch (error) {
      console.error('Error updating onboarding data:', error);
      throw error;
    }
  };

  const saveOnboardingData = async () => {
    try {
      await saveOnboardingDataToStorage(onboardingData);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await markCompleteInStorage();
      setIsComplete(true);
      const updatedData = { ...onboardingData, completedAt: Date.now() };
      setOnboardingData(updatedData);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        saveOnboardingData,
        markOnboardingComplete,
        isComplete,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

