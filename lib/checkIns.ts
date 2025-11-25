import { useMutation, useQuery } from './convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

// Hook for check-in operations (mutations only)
export function useCheckIns() {
  const createCheckIn = useMutation(api.checkIns.createCheckIn);
  const archiveCheckIn = useMutation(api.checkIns.archiveCheckIn);
  const archiveCheckIns = useMutation(api.checkIns.archiveCheckIns);

  return {
    createCheckIn,
    archiveCheckIn,
    archiveCheckIns,
  };
}

// Hook to get check-ins for a group
export function useGroupCheckIns(groupId: Id<'groups'> | null, limit?: number) {
  const checkIns = useQuery(
    api.checkIns.getGroupCheckIns,
    groupId ? { groupId, limit } : "skip"
  );

  return checkIns;
}

// Hook to get user's check-ins
export function useUserCheckIns(userId: Id<'users'> | null, limit?: number) {
  const checkIns = useQuery(
    api.checkIns.getUserCheckIns,
    userId ? { userId, limit } : "skip"
  );

  return checkIns;
}

// Hook to check if user checked in today
export function useHasCheckedInToday(userId: Id<'users'> | null) {
  const hasCheckedIn = useQuery(
    api.checkIns.hasCheckedInToday,
    userId ? { userId } : "skip"
  );

  return hasCheckedIn;
}

// Hook to get check-ins by date range
export function useCheckInsByDateRange(
  userId: Id<'users'> | null,
  groupId: Id<'groups'> | null,
  startDate: number,
  endDate: number
) {
  const checkIns = useQuery(
    api.checkIns.getCheckInsByDateRange,
    { userId: userId || undefined, groupId: groupId || undefined, startDate, endDate }
  );

  return checkIns;
}

