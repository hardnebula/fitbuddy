import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';

const SELECTED_GROUP_KEY = 'fitbuddy_selected_group_id';

interface UseGroupSelectionReturn {
  selectedGroupId: Id<'groups'> | null;
  setSelectedGroupId: (id: Id<'groups'> | null) => void;
  selectedGroup: any | null;
  isLoading: boolean;
  refreshSelection: () => Promise<void>;
}

export function useGroupSelection(
  groups: any[] | undefined
): UseGroupSelectionReturn {
  const [selectedGroupId, setSelectedGroupId] = useState<Id<'groups'> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const previousGroupsLength = useRef<number | undefined>(undefined);

  // Function to load saved group ID from AsyncStorage
  const loadSavedGroupId = useCallback(async () => {
    try {
      const savedGroupId = await AsyncStorage.getItem(SELECTED_GROUP_KEY);
      if (savedGroupId) {
        setSelectedGroupId(savedGroupId as Id<'groups'>);
      }
    } catch (error) {
      console.error('Error loading saved group ID:', error);
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
      if (previousGroupsLength.current !== undefined && 
          currentLength > previousGroupsLength.current) {
        // A new group was added, reload the selection
        loadSavedGroupId();
      }
      previousGroupsLength.current = currentLength;
    }
  }, [groups, loadSavedGroupId]);

  // Compute the selected group based on available groups
  const selectedGroup = useMemo(() => {
    if (!groups || groups.length === 0) return null;

    // If we have a saved selection, try to find it
    if (selectedGroupId) {
      const found = groups.find((g) => g._id === selectedGroupId);
      if (found) return found;
    }

    // If no valid selection and we've loaded from storage, default to first group
    if (hasLoadedFromStorage) {
      return groups[0] || null;
    }

    return null;
  }, [groups, selectedGroupId, hasLoadedFromStorage]);

  // Save to AsyncStorage when selection changes
  const setSelectedGroupIdWithPersistence = useCallback(
    async (id: Id<'groups'> | null) => {
      setSelectedGroupId(id);
      try {
        if (id) {
          await AsyncStorage.setItem(SELECTED_GROUP_KEY, id);
        } else {
          await AsyncStorage.removeItem(SELECTED_GROUP_KEY);
        }
      } catch (error) {
        console.error('Error saving group ID:', error);
      }
    },
    []
  );

  return {
    selectedGroupId: selectedGroup?._id || null,
    setSelectedGroupId: setSelectedGroupIdWithPersistence,
    selectedGroup,
    isLoading,
    refreshSelection: loadSavedGroupId,
  };
}
