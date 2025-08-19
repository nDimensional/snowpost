import { JoseKey } from "@atproto/jwk-jose";

import { env } from "cloudflare:workers";

import {
	NodeOAuthClient,
	NodeSavedState,
	NodeSavedSession,
} from "atproto-oauth-client-cloudflare-workers";

// import {
// 	NodeOAuthClient,
// 	NodeSavedState,
// 	NodeSavedSession,
// } from "@/app/auth/oauth-client";

const host = "https://snowpost.ndim.workers.dev";

const parseKey = (value: string) =>
	JSON.parse(Buffer.from(value, "base64").toString("utf8"));

export const client = new NodeOAuthClient({
	clientMetadata: {
		client_id: `${host}/oauth/client-metadata.json`,
		client_name: "Snowpost",
		client_uri: host,
		logo_uri: `${host}/logo.png`,
		tos_uri: `${host}/tos`,
		policy_uri: `${host}/policy`,
		redirect_uris: [`${host}/oauth/callback`],
		grant_types: ["authorization_code", "refresh_token"],
		scope: "atproto transition:generic",
		response_types: ["code"],
		application_type: "web",
		token_endpoint_auth_method: "private_key_jwt",
		token_endpoint_auth_signing_alg: "RS256",
		dpop_bound_access_tokens: true,
		jwks_uri: `${host}/oauth/jwks.json`,
	},

	// Used to authenticate the client to the token endpoint. Will be used to
	// build the jwks object to be exposed on the "jwks_uri" endpoint.
	keyset: await Promise.all([
		JoseKey.fromImportable(parseKey(env.PRIVATE_KEY_1), "key1"),
		// JoseKey.fromImportable(parseKey(env.PRIVATE_KEY_2), "key2"),
		// JoseKey.fromImportable(parseKey(env.PRIVATE_KEY_3), "key3"),
	]),

	// Interface to store authorization state data (during authorization flows)
	stateStore: {
		async set(key: string, internalState: NodeSavedState): Promise<void> {
			await env.OAUTH_STATE_STORE.put(key, JSON.stringify(internalState));
		},
		async get(key: string): Promise<NodeSavedState | undefined> {
			const value = await env.OAUTH_STATE_STORE.get(key);
			if (value === null) {
				return undefined;
			} else {
				return JSON.parse(value);
			}
		},
		async del(key: string): Promise<void> {
			await env.OAUTH_STATE_STORE.delete(key);
		},
	},

	// Interface to store authenticated session data
	sessionStore: {
		async set(sub: string, session: NodeSavedSession): Promise<void> {
			await env.OAUTH_SESSION_STORE.put(sub, JSON.stringify(session));
		},
		async get(sub: string): Promise<NodeSavedSession | undefined> {
			const value = await env.OAUTH_SESSION_STORE.get(sub);
			if (value === null) {
				return undefined;
			} else {
				return JSON.parse(value);
			}
		},
		async del(sub: string): Promise<void> {
			await env.OAUTH_SESSION_STORE.delete(sub);
		},
	},

	// // A lock to prevent concurrent access to the session store. Optional if only one instance is running.
	// requestLock,
});

// // Whenever needed, restore a user's session
// async function worker() {
// 	const userDid = "did:plc:123";

// 	const oauthSession = await client.restore(userDid);

// 	// Note: If the current access_token is expired, the session will automatically
// 	// (and transparently) refresh it. The new token set will be saved though
// 	// the client's session store.

// 	const agent = new Agent(oauthSession);

// 	// Make Authenticated API calls
// 	const profile = await agent.getProfile({ actor: agent.did });
// 	console.log("Bsky profile:", profile.data);
// }
