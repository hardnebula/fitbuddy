import { useMutation, useQuery } from './convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

// Hook for user authentication
export function useAuth() {
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  const login = async (email: string, name: string, avatar?: string) => {
    try {
      const userId = await getOrCreateUser({
        email,
        name,
        avatar,
      });
      return userId;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return {
    login,
  };
}

// Hook to get user by email
export function useUserByEmail(email: string | null) {
  const user = useQuery(
    api.users.getUserByEmail,
    email ? { email } : "skip"
  );

  return user;
}

// Hook to get current user
export function useCurrentUser(userId: Id<'users'> | null) {
  const user = useQuery(
    api.users.getUser,
    userId ? { userId } : "skip"
  );

  return user;
}

