// Polyfill for URL in React Native
import 'react-native-url-polyfill/auto';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

// Get Convex URL from environment variables
// In Expo, we use EXPO_PUBLIC_ prefix for public env vars
const getConvexUrl = () => {
  // Try Expo public env var first (recommended for Expo)
  // These are set via EXPO_PUBLIC_ prefix in .env
  if (process.env.EXPO_PUBLIC_CONVEX_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_URL;
  }
  
  // Fallback to Constants (if configured in app.json)
  const url = Constants.expoConfig?.extra?.convexUrl;
  if (url) {
    return url;
  }
  
  // Development fallback - will need to be set
  console.warn('CONVEX_URL not found. Please set EXPO_PUBLIC_CONVEX_URL in your .env file');
  return '';
};

// Create Convex client
export const convexClient = new ConvexReactClient(getConvexUrl());

// Export provider component
export { ConvexProvider };

// Export hooks from convex/react
export {
  useQuery,
  useMutation,
  useAction,
  useConvex,
  usePaginatedQuery,
} from 'convex/react';

