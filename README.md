# Teo

**Teo: Daily Accountability**

An accountability app built with React Native and Expo. Stay consistent with your group and build habits together with Teo, your accountability buddy.

## Features

- ✅ Group-based accountability
- ✅ Daily check-ins with photo support
- ✅ Streak tracking with animated badges
- ✅ Group feed with real-time updates
- ✅ Profile stats and monthly calendar view
- ✅ Dark theme with modern blue design
- ✅ Smooth animations and micro-interactions
- ✅ Haptic feedback for better UX

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on your preferred platform:

```bash
# iOS
npm run ios

# Android
npm run android

# Web (limited functionality)
npm run web
```

### First Run

The app will start at the welcome screen. You can:

- Create a new group
- Join an existing group with an invite code
- Explore all features with mock data

## Design System

### Colors

- **Primary**: #3B82F6 (Bright Blue) - buttons, CTAs, active elements
- **Background**: #0F172A (Almost Black) - main background
- **Secondary**: #1E293B (Deep Navy) - cards, surfaces
- **Accent**: #22D3EE (Soft Cyan) - highlights, streak glow
- **Error**: #EF4444 (Crimson Red) - errors, delete actions
- **Warning**: #F97316 (Orange) - celebrations, notifications

### Typography

- Base font size: 15px
- Headings: 20px+
- High contrast (white on dark)
- System fonts (SF Pro Display iOS, Roboto Android)

### Spacing

- Consistent gaps: 18-22px
- Generous whitespace for clarity

### Border Radius

- Soft corners: 10-16px
- Rounded buttons and cards

## Project Structure

```
Teo/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── welcome.tsx      # Welcome/login screen
│   │   ├── create-group.tsx # Create new group
│   │   └── join-group.tsx   # Join with invite code
│   ├── (tabs)/              # Main app tabs
│   │   ├── home.tsx         # Home feed with check-ins
│   │   ├── groups.tsx       # Groups management
│   │   ├── profile.tsx      # User profile & stats
│   │   └── settings.tsx     # App settings
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── components/              # Reusable UI components
│   ├── Button.tsx          # Primary button component
│   ├── Card.tsx            # Card container
│   ├── Input.tsx           # Text input field
│   ├── Avatar.tsx          # User avatar
│   ├── AnimatedButton.tsx  # Button with animations
│   ├── StreakBadge.tsx     # Animated streak badge
│   └── ...
├── constants/              # Theme and constants
│   ├── Colors.ts           # Color palette
│   └── Theme.ts            # Theme configuration
├── types/                  # TypeScript type definitions
└── assets/                 # Images, icons, fonts
```

## Key Features Explained

### Check-in Flow

1. Tap the check-in button on home screen
2. Add optional photo and note
3. Confirm check-in
4. See success feedback and updated streak

### Group Management

- Create groups with up to 4 members
- Share invite codes
- Track group streaks
- View group feed with member check-ins

### Profile & Stats

- View total check-ins
- See best and current streak
- Monthly calendar showing check-in history
- Editable profile information

### Animations

- Button press animations with haptic feedback
- Streak badge pulse animation
- Smooth transitions between screens
- Glow effects on active elements

## Development

### Adding New Features

1. Create components in `components/` directory
2. Use theme constants from `constants/Theme.ts`
3. Follow the design system guidelines
4. Add TypeScript types in `types/` directory

### Styling Guidelines

- Always use Theme constants for colors, spacing, typography
- Maintain consistent spacing (18-22px gaps)
- Use rounded corners (10-16px border radius)
- Ensure high contrast for accessibility
- Minimum touch targets: 52x52px

## Technologies Used

- **React Native 0.76** - Mobile framework
- **Expo SDK 54** - Development platform
- **Expo Router 4.0** - File-based routing
- **TypeScript** - Type safety
- **React Native Reanimated 3.16** - Animations
- **Expo Linear Gradient** - Gradient effects
- **Expo Image Picker** - Photo selection
- **Expo Haptics** - Haptic feedback

## Future Enhancements

- Backend integration for real data
- Push notifications for reminders
- Social features (comments, likes)
- Activity type tracking
- Progress photos gallery
- Export stats and data

## License

Private project - All rights reserved

## Support

For issues or questions, please contact the development team.
