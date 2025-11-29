import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { anonymous } from "better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false }
) => {
	// Get baseURL from Convex environment variable
	const baseURL = process.env.CONVEX_SITE_URL;

	// Build base trustedOrigins array
	const baseOrigins = [
		"teo://",
		"https://appleid.apple.com", // Required for Apple Sign In
	];

	// Add Convex site URL if available
	if (baseURL) {
		baseOrigins.push(baseURL);
	}

	// Use function-based trustedOrigins to dynamically allow Expo dev origins
	const trustedOrigins = async (request: Request) => {
		const origins = [...baseOrigins];

		// Get origin from request headers
		const origin = request.headers.get("origin");

		// Allow any exp:// origin (Expo dev server)
		if (origin && origin.startsWith("exp://")) {
			origins.push(origin);
		}

		return origins;
	};

	return betterAuth({
		baseURL,
		// disable logging when createAuth is called just to generate options.
		// this is not required, but there's a lot of noise in logs without it.
		logger: {
			disabled: optionsOnly,
		},
		trustedOrigins,
		database: authComponent.adapter(ctx),
		// Configure Apple and Google social providers
		// These must be set via: npx convex env set APPLE_CLIENT_ID=...
		socialProviders: {
			apple: {
				clientId: process.env.APPLE_CLIENT_ID as string,
				clientSecret: process.env.APPLE_CLIENT_SECRET as string,
				// Optional: appBundleIdentifier for iOS
				appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
			},
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},
		plugins: [
			// The Expo and Convex plugins are required
			expo(),
			convex(),
			// Anonymous authentication plugin
			anonymous({
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					// When an anonymous user signs in with a real account,
					// we can migrate their data here if needed
					// The anonymous user will be deleted by default
					console.log("Linking anonymous account:", {
						anonymousUserId: anonymousUser.user.id,
						newUserId: newUser.user.id,
					});
				},
			}),
		],
	});
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx);
	},
});
