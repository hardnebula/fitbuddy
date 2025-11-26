/**
 * FitBuddy Color Schemes
 * Light and Dark mode color definitions
 */

export const LightColors = {
  // Primary
  primary: '#6C47FF', // Purple - buttons, CTAs, active elements
  primaryDark: '#5534CC',
  primaryLight: '#8B6FFF',
  
  // Secondary
  secondary: '#F5F5F5', // Light gray - backgrounds, cards
  
  // Accent
  accent: '#6C47FF', // Purple accent
  accentDark: '#5534CC',
  
  // Support
  error: '#EF4444', // Red - error, delete actions
  warning: '#F97316', // Orange - warnings, notifications
  success: '#10B981', // Green - success states
  
  // Backgrounds
  background: '#FFFFFF', // White
  surface: '#FFFFFF', // White
  card: '#FFFFFF',
  cardSecondary: '#F9FAFB',
  
  // Borders & Dividers
  border: '#E5E5E5', // Light gray
  divider: '#E5E5E5',
  
  // Text
  text: '#000000', // Black - main text
  textSecondary: '#666666', // Gray - secondary text
  textTertiary: '#999999', // Light gray - tertiary text
  
  // Status
  completed: '#10B981',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const DarkColors = {
  // Primary
  primary: '#8B6FFF', // Lighter purple for dark mode
  primaryDark: '#6C47FF',
  primaryLight: '#A890FF',
  
  // Secondary
  secondary: '#1E293B', // Deep navy - backgrounds, cards
  
  // Accent
  accent: '#8B6FFF', // Lighter purple accent
  accentDark: '#6C47FF',
  
  // Support
  error: '#EF4444', // Red - error, delete actions
  warning: '#F97316', // Orange - warnings, notifications
  success: '#22D3EE', // Cyan - success states
  
  // Backgrounds
  background: '#0F172A', // Almost black
  surface: '#1E293B', // Deep navy
  card: '#1E293B',
  cardSecondary: '#334155',
  
  // Borders & Dividers
  border: '#334155', // Slate gray
  divider: '#334155',
  
  // Text
  text: '#FFFFFF', // White - main text
  textSecondary: '#CBD5E1', // Light gray - secondary text
  textTertiary: '#94A3B8', // Medium gray - tertiary text
  
  // Status
  completed: '#22D3EE',
  
  // Overlays
  overlay: 'rgba(15, 23, 42, 0.8)',
  overlayLight: 'rgba(15, 23, 42, 0.5)',
};

export type ColorScheme = typeof LightColors;
