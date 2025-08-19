import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { setCommonHeaders } from "@/app/headers";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { About } from "@/app/pages/About";
import { Login } from "@/app/pages/Login";
import { NewPost } from "@/app/pages/NewPost";
import { ViewPost } from "@/app/pages/ViewPost";
import { client } from "@/app/auth";
import { sessionStore } from "@/app/auth/session";
import { handlePattern } from "@/app/shared/utils";

export type AppContext = {
	session: { did: string } | null;
};

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

			const responseHeaders = new Headers(response.headers);
			sessionStore.save(responseHeaders, { did: session.did });
			responseHeaders.set("Location", "/");
			return new Response(null, {
				...response,
				status: 302,
				headers: responseHeaders,
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
			return new Response("missing 'handle' query parameter", { status: 400 });
		} else if (!handlePattern.test(handle)) {
			return new Response("invalid handle", { status: 400 });
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

	async ({ ctx, request, headers }) => {
		ctx.session = await sessionStore.load(request);
	},

	render(Document, [
		route("/", Home),
		route("/about", About),
		route("/login", Login),
		route("/new", NewPost),
		route("/:user/:slug", ViewPost),
	]),
]);
