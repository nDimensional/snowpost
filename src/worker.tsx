import { defineApp, ErrorResponse } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { env } from "cloudflare:workers";

import { setCommonHeaders } from "@/app/headers";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { About } from "@/app/pages/About";
import { Login } from "@/app/pages/Login";
import { Write } from "@/app/pages/Write";
import { ViewPost } from "@/app/pages/ViewPost";
import { client } from "@/app/auth";
import { resolveUser } from "@/app/shared/resolveUser";
import { getClock, handlePattern } from "@/app/shared/utils";
import {
	createSessionCookie,
	generateSessionId,
	isValidSessionId,
} from "rwsdk/auth";

export type AppContext = {
	session: { did: string } | null;
};

const cookieName = "session_id";

export default defineApp([
	setCommonHeaders(),

	route("/oauth/client-metadata.json", () => {
		return new Response(JSON.stringify(client.clientMetadata), {
			headers: { "content-type": "application/json" },
		});
	}),

	route("/oauth/jwks.json", () => {
		return new Response(JSON.stringify(client.jwks), {
			headers: { "content-type": "application/json" },
		});
	}),

	route("/oauth/callback", async ({ ctx, request, response }) => {
		try {
			const url = new URL(request.url);
			const params = new URLSearchParams(url.search);
			const { session, state } = await client.callback(params);
			// Process successful authentication here
			console.log("authorize() was called with state:", state);
			console.log("User authenticated as:", session.did);

			// const tokenInfo = await session.getTokenInfo(false);

			const sessionId = await generateSessionId({
				secretKey: env.AUTH_SECRET_KEY,
			});

			await env.WEB_SESSION_STORE.put(
				sessionId,
				JSON.stringify({ did: session.did }),
			);

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/",
					"Set-Cookie": createSessionCookie({
						name: cookieName,
						sessionId,
						maxAge: undefined,
					}),
				},
			});
		} catch (err) {
			console.error(err);
			return new Response(JSON.stringify(err), { status: 500 });
		}
	}),

	route("/oauth/login", async ({ ctx, request }) => {
		const url = new URL(request.url);
		const params = new URLSearchParams(url.search);
		const handle = params.get("handle");
		if (handle === null) {
			throw new ErrorResponse(400, "missing 'handle' query parameter");
		} else if (!handlePattern.test(handle)) {
			throw new ErrorResponse(400, "invalid handle");
		}

		try {
			// const state = "434321";

			const url = await client.authorize(handle, {
				signal: request.signal,
				// state: null,
				ui_locales: "en",
			});

			return new Response(null, {
				status: 302,
				headers: { Location: url.href },
			});
		} catch (err) {
			console.error(err);
			return new Response(JSON.stringify(err), { status: 500 });
		}
	}),

	async ({ ctx, request }) => {
		const sessionId = getSessionIdFromCookie(request);
		if (!sessionId) {
			return;
		}

		const isValid = await isValidSessionId({
			sessionId,
			secretKey: env.AUTH_SECRET_KEY,
		});

		if (!isValid) {
			throw new ErrorResponse(401, "Invalid session id");
		}

		const value = await env.WEB_SESSION_STORE.get(sessionId);
		if (value === null) {
			return;
		}

		ctx.session = JSON.parse(value);
	},

	route("/api/post", async ({ ctx, request }) => {
		if (ctx.session === undefined || ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized");
		}

		const identity = await resolveUser(ctx.session.did);
		if (identity === null) {
			throw new ErrorResponse(404, `Failed to resolve user ${ctx.session.did}`);
		}

		let content: {};
		try {
			content = await request.json();
		} catch (err) {
			console.error(err);
			throw new ErrorResponse(400, "Bad Request");
		}

		const clock = getClock();

		try {
			await env.R2.put(
				`${ctx.session.did}/${clock}/post.json`,
				JSON.stringify(content),
			);
		} catch (err) {
			throw new ErrorResponse(500, `Failed to publish post: ${err}`);
		}

		const user = identity.handle ?? identity.did;
		return new Response(null, {
			status: 201,
			headers: { Location: `/${user}/${clock}` },
		});
	}),

	render(Document, [
		route("/", Home),
		route("/about", About),
		route("/login", Login),
		route("/write", Write),
		route("/:user/:slug", ViewPost),
	]),
]);

const getSessionIdFromCookie = (request: Request): string | undefined => {
	const cookieHeader = request.headers.get("Cookie");
	if (!cookieHeader) return undefined;

	for (const cookie of cookieHeader.split(";")) {
		const trimmedCookie = cookie.trim();
		const separatorIndex = trimmedCookie.indexOf("=");
		if (separatorIndex === -1) continue;

		const key = trimmedCookie.slice(0, separatorIndex);
		const value = trimmedCookie.slice(separatorIndex + 1);

		if (key === cookieName) {
			return value;
		}
	}
};
