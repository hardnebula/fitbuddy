import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Id } from '@/convex/_generated/dataModel';

const SELECTED_GROUP_KEY = 'fitbuddy_selected_group_id';

interface UseGroupSelectionReturn {
  selectedGroupId: Id<'groups'> | null;
  setSelectedGroupId: (id: Id<'groups'> | null) => void;
  selectedGroup: any | null;
  isLoading: boolean;
}

export function useGroupSelection(
  groups: any[] | undefined
): UseGroupSelectionReturn {
  const [selectedGroupId, setSelectedGroupId] = useState<Id<'groups'> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Load saved group ID from AsyncStorage on mount
  useEffect(() => {
    const loadSavedGroupId = async () => {
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
    };

    loadSavedGroupId();
  }, []);

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
  };
}
