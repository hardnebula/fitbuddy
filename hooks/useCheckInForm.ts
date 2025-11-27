import { useState, useCallback } from 'react';
import { Id } from '@/convex/_generated/dataModel';

interface UseCheckInFormReturn {
  note: string;
  photo: string | null;
  selectedGroups: Id<'groups'>[];
  setNote: (note: string) => void;
  setPhoto: (photo: string | null) => void;
  toggleGroup: (groupId: Id<'groups'>) => void;
  toggleAllGroups: (allGroupIds: Id<'groups'>[]) => void;
  reset: () => void;
}

export function useCheckInForm(): UseCheckInFormReturn {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Id<'groups'>[]>([]);

  const toggleGroup = useCallback((groupId: Id<'groups'>) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const toggleAllGroups = useCallback((allGroupIds: Id<'groups'>[]) => {
    setSelectedGroups((prev) =>
      prev.length === allGroupIds.length ? [] : allGroupIds
    );
  }, []);

  const reset = useCallback(() => {
    setNote('');
    setPhoto(null);
    setSelectedGroups([]);
  }, []);

  return {
    note,
    photo,
    selectedGroups,
    setNote,
    setPhoto,
    toggleGroup,
    toggleAllGroups,
    reset,
  };
}

