import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingData } from "../types/onboarding";

const ONBOARDING_DATA_KEY = "@fitbuddy:onboarding_data";
const ONBOARDING_COMPLETE_KEY = "@fitbuddy:onboarding_complete";

/**
 * Save onboarding data to AsyncStorage
 */
export async function saveOnboardingData(
	data: Partial<OnboardingData>
): Promise<void> {
	try {
		const existingData = await getOnboardingData();
		const updatedData: OnboardingData = {
			...existingData,
			...data,
		};
		await AsyncStorage.setItem(
			ONBOARDING_DATA_KEY,
			JSON.stringify(updatedData)
		);
	} catch (error) {
		console.error("Error saving onboarding data:", error);
		throw error;
	}
}

/**
 * Retrieve onboarding data from AsyncStorage
 */
export async function getOnboardingData(): Promise<OnboardingData> {
	try {
		const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
		if (data) {
			return JSON.parse(data) as OnboardingData;
		}
		return {};
	} catch (error) {
		console.error("Error getting onboarding data:", error);
		return {};
	}
}

/**
 * Mark onboarding as completed
 */
export async function markOnboardingComplete(): Promise<void> {
	try {
		const data = await getOnboardingData();
		const updatedData: OnboardingData = {
			...data,
			completedAt: Date.now(),
		};
		await AsyncStorage.setItem(
			ONBOARDING_DATA_KEY,
			JSON.stringify(updatedData)
		);
		await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
	} catch (error) {
		console.error("Error marking onboarding complete:", error);
		throw error;
	}
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingComplete(): Promise<boolean> {
	try {
		// Check the completion flag first (faster check)
		const completeFlag = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
		if (completeFlag === "true") {
			return true;
		}

		// Also check if completedAt exists in data (fallback check)
		const data = await getOnboardingData();
		const hasCompletedAt = !!data.completedAt;

		if (hasCompletedAt) {
			// Sync the flag if data exists but flag doesn't
			await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
			return true;
		}

		return false;
	} catch (error) {
		console.error("Error checking onboarding completion:", error);
		return false;
	}
}

/**
 * Clear onboarding data (useful for logout/reset)
 */
export async function clearOnboardingData(): Promise<void> {
	try {
		await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
		await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
	} catch (error) {
		console.error("Error clearing onboarding data:", error);
		throw error;
	}
}
