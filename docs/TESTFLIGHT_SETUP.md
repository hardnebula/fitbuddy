# TestFlight Production Build Setup Guide

This guide walks you through creating a production build for iOS and submitting it to TestFlight.

## Prerequisites

- **Apple Developer Account**: You need an active Apple Developer account ($99/year)
- **EAS Account**: Sign up at [expo.dev](https://expo.dev) (free tier available)
- **App Store Connect**: Your app must be registered in App Store Connect

## Step 1: Install EAS CLI

Install the EAS CLI globally:

```bash
npm install -g eas-cli
```

Or use npx (no global install needed):

```bash
npx eas-cli --version
```

## Step 2: Login to EAS

Login to your Expo account:

```bash
eas login
```

If you don't have an account, create one at [expo.dev](https://expo.dev)

## Step 3: Configure Build Credentials

Set up your iOS build credentials:

```bash
eas credentials
```

Follow the prompts:

1. **Select platform**: Choose `iOS`
2. **Which build profile do you want to configure?**: Select `production`
3. **Do you want to log in to your Apple account?**: Press `Y`
4. **What do you want to do?**: Select `Build credentials` → `All: Set up all the required credentials to build your project`
5. **Re-use the previous Distribution Certificate?**: Press `Y` (or `N` if this is your first time)
6. **Generate a new Apple Provisioning Profile?**: Press `Y`

Once credentials are set up, press `Ctrl+C` to exit.

## Step 4: Create Production Build

Create your production build:

```bash
npm run build:ios:production
```

Or directly:

```bash
eas build --platform ios
```

This will:

- Queue the build on EAS servers
- Auto-increment the build number
- Create an optimized production build for App Store distribution

You can monitor the build progress at [expo.dev](https://expo.dev/accounts/[your-account]/projects/teo/builds)

## Step 5: Submit to App Store Connect

After the build completes, submit it to App Store Connect:

```bash
npm run submit:ios
```

Or directly:

```bash
eas submit --platform ios
```

Follow the prompts:

1. **Select a build from EAS**: Choose the latest build ID
2. **Reuse this App Store Connect API Key?**: Press `Y` (or follow prompts to create one)

## Step 6: Set Up TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Apps** → Select your app → **TestFlight** tab
3. Wait for Apple to process the build (may take 10-30 minutes)
4. Under **Internal Testing**, create a test group:
   - Click **+** next to Internal Testing
   - Create a new group (e.g., "Internal Testers")
   - Add the build to the group
   - Add testers by email

## Step 7: Testers Install via TestFlight

Testers will receive an email invitation. They need to:

1. Install the TestFlight app from the App Store
2. Accept the invitation
3. Tap **Install** in TestFlight
4. Open the app from their home screen

## Automated Submission (Optional)

For future releases, you can combine build and submission:

```bash
npm run build:ios:auto-submit
```

This automatically:

- Creates the build
- Submits to TestFlight when complete

**Note**: This submits to TestFlight only. You'll still need to manually promote builds to the App Store when ready for public release.

## Troubleshooting

### Build Fails

- Check that your `app.json` has correct `bundleIdentifier` (currently: `com.teo.app`)
- Ensure your Apple Developer account is active
- Verify credentials are set up correctly: `eas credentials`

### Submission Fails

- Ensure your app exists in App Store Connect
- Check that you have the correct permissions in App Store Connect
- Verify your App Store Connect API key is valid

### TestFlight Not Showing Build

- Wait 10-30 minutes for Apple to process the build
- Check that the build status is "Ready to Submit" in App Store Connect
- Ensure you've added the build to a test group

## Next Steps

After successful TestFlight testing:

1. Fix any issues found during testing
2. Create a new build with fixes
3. Submit for App Store review when ready
4. Fill out App Store metadata (screenshots, description, etc.)
5. Submit for review in App Store Connect

## Useful Commands

```bash
# Check build status
eas build:list

# View build details
eas build:view [build-id]

# Check submission status
eas submit:list

# Update credentials if needed
eas credentials
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
