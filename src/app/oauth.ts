import { BrowserOAuthClient } from "@atproto/oauth-client-browser";

const host = "https://snowpost.ndim.workers.dev";

export const client = new BrowserOAuthClient({
	clientMetadata: {
		client_id: `${host}/oauth/client-metadata.json`,
		client_name: "Snowpost",
		client_uri: host,
		logo_uri: `${host}/logo.png`,
		tos_uri: `${host}/tos`,
		policy_uri: `${host}/policy`,
		redirect_uris: [`${host}/oauth/callback`],
		scope: "atproto",
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		token_endpoint_auth_method: "none",
		application_type: "web",
		dpop_bound_access_tokens: true,
	},
	// ...
});
