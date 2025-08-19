import { SessionStore, defineSessionStore } from "rwsdk/auth";

import { env } from "cloudflare:workers";

export type Session = {
	did: string;
	expiration?: Date;
};

export const sessionStore: SessionStore<Session> = defineSessionStore({
	get: async (sessionId: string) => {
		const value = await env.WEB_SESSION_STORE.get(sessionId);
		if (value === null) {
			return null;
		} else {
			const { did } = JSON.parse(value);
			return { did };
		}
	},
	set: async (sessionId: string, { did, expiration }) => {
		const value = JSON.stringify({ did });
		await env.WEB_SESSION_STORE.put(sessionId, value, {
			expiration: expiration
				? Math.floor(expiration.getTime() / 1000)
				: undefined,
		});
	},
	unset: async (sessionId: string) => {
		await env.WEB_SESSION_STORE.delete(sessionId);
	},
});
