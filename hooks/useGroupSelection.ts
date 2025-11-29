import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";

const SELECTED_GROUP_KEY = "teo_selected_group_id";
const PERSONAL_MODE_KEY = "PERSONAL"; // Special marker to indicate Personal was explicitly selected

interface UseGroupSelectionReturn {
	selectedGroupId: Id<"groups"> | null;
	setSelectedGroupId: (id: Id<"groups"> | null) => void;
	selectedGroup: any | null;
	isLoading: boolean;
	refreshSelection: () => Promise<void>;
}

export function useGroupSelection(
	groups: any[] | undefined
): UseGroupSelectionReturn {
	const [selectedGroupId, setSelectedGroupId] = useState<
		Id<"groups"> | null | undefined
	>(
		undefined // Use undefined to indicate "not loaded yet"
	);
	const [isLoading, setIsLoading] = useState(true);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const previousGroupsLength = useRef<number | undefined>(undefined);

	// Function to load saved group ID from AsyncStorage
	const loadSavedGroupId = useCallback(async () => {
		try {
			const savedGroupId = await AsyncStorage.getItem(SELECTED_GROUP_KEY);
			if (savedGroupId === PERSONAL_MODE_KEY) {
				// User explicitly selected Personal mode
				setSelectedGroupId(null);
			} else if (savedGroupId) {
				// User selected a specific group
				setSelectedGroupId(savedGroupId as Id<"groups">);
			} else {
				// No selection saved yet - default to first group if available
				// This will be handled in the selectedGroup computation
				setSelectedGroupId(undefined as any);
			}
		} catch (error) {
			console.error("Error loading saved group ID:", error);
			setSelectedGroupId(undefined as any);
		} finally {
			setIsLoading(false);
			setHasLoadedFromStorage(true);
		}
	}, []);

	// Load on mount
	useEffect(() => {
		loadSavedGroupId();
	}, [loadSavedGroupId]);

	// Reload when screen gains focus (handles navigation from create/join group)
	useFocusEffect(
		useCallback(() => {
			// Reload from AsyncStorage when screen gains focus
			loadSavedGroupId();
		}, [loadSavedGroupId])
	);

	// Also reload when groups array changes (new group added)
	useEffect(() => {
		if (groups !== undefined) {
			const currentLength = groups.length;
			if (
				previousGroupsLength.current !== undefined &&
				currentLength > previousGroupsLength.current
			) {
				// A new group was added, reload the selection
				loadSavedGroupId();
			}
			previousGroupsLength.current = currentLength;
		}
	}, [groups, loadSavedGroupId]);

	// Compute the selected group based on available groups
	const selectedGroup = useMemo(() => {
		// If selectedGroupId is explicitly null, return null (Personal mode)
		if (selectedGroupId === null && hasLoadedFromStorage) {
			return null;
		}

		if (!groups || groups.length === 0) return null;

		// If we have a saved selection, try to find it
		if (selectedGroupId) {
			const found = groups.find((g) => g._id === selectedGroupId);
			if (found) return found;
		}

		// If no valid selection and we've loaded from storage, default to first group
		// But only if selectedGroupId is undefined (not explicitly set to null)
		if (hasLoadedFromStorage && selectedGroupId === undefined) {
			return groups[0] || null;
		}

		return null;
	}, [groups, selectedGroupId, hasLoadedFromStorage]);

	// Save to AsyncStorage when selection changes
	const setSelectedGroupIdWithPersistence = useCallback(
		async (id: Id<"groups"> | null) => {
			setSelectedGroupId(id);
			try {
				if (id) {
					// Save the group ID
					await AsyncStorage.setItem(SELECTED_GROUP_KEY, id);
				} else {
					// Save special marker to indicate Personal was explicitly selected
					await AsyncStorage.setItem(SELECTED_GROUP_KEY, PERSONAL_MODE_KEY);
				}
			} catch (error) {
				console.error("Error saving group ID:", error);
			}
		},
		[]
	);

	return {
		selectedGroupId:
			selectedGroupId === undefined
				? selectedGroup?._id || null
				: selectedGroupId, // Return actual state, or derive from selectedGroup if not loaded yet
		setSelectedGroupId: setSelectedGroupIdWithPersistence,
		selectedGroup,
		isLoading,
		refreshSelection: loadSavedGroupId,
	};
}
