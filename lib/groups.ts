import { useMutation, useQuery } from './convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

// Hook for group operations
export function useGroups() {
  const createGroup = useMutation(api.groups.createGroup);
  const joinGroup = useMutation(api.groups.joinGroup);
  const getUserGroups = useQuery(api.groups.getUserGroups);
  const getGroup = useQuery(api.groups.getGroup);
  const getGroupMembers = useQuery(api.groups.getGroupMembers);
  const archiveGroup = useMutation(api.groups.archiveGroup);

  return {
    createGroup,
    joinGroup,
    getUserGroups,
    getGroup,
    getGroupMembers,
    archiveGroup,
  };
}

// Hook to get group by invite code
export function useGroupByInviteCode(inviteCode: string | null) {
  const group = useQuery(
    api.groups.getGroupByInviteCode,
    inviteCode ? { inviteCode } : "skip"
  );

  return group;
}

