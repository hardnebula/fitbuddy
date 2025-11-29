# Better Auth Setup Guide

## Required Environment Variables

Set these environment variables in Convex using `npx convex env set`:

### 1. Convex Site URL (Required)

```bash
npx convex env set CONVEX_SITE_URL=https://your-deployment.convex.site
```

### 2. Apple Sign In Credentials

```bash
npx convex env set APPLE_CLIENT_ID=your-apple-client-id
npx convex env set APPLE_CLIENT_SECRET=your-apple-client-secret
npx convex env set APPLE_APP_BUNDLE_IDENTIFIER=com.teo.app  # Optional, for iOS
```

### 3. Google Sign In Credentials

```bash
npx convex env set GOOGLE_CLIENT_ID=your-google-client-id
npx convex env set GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Getting OAuth Credentials

### Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Create a new Services ID
3. Configure Sign In with Apple
4. Copy the Client ID and create a Client Secret

### Google Sign In

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://your-deployment.convex.site/api/auth/callback/google`
4. Copy the Client ID and Client Secret

## Expo Dev Server Origin

If you see an error about `exp://192.168.x.x:8081` being an invalid origin:

1. The Expo dev server origin is automatically added to `trustedOrigins` with pattern `exp://*`
2. If you still see errors, you may need to restart your Convex dev server after setting environment variables
3. For production, ensure your app's scheme matches `teo://` in your `app.json`

## Verification

After setting all environment variables, restart your Convex dev server:

```bash
npx convex dev
```

Then restart your Expo app. The authentication should work properly.
