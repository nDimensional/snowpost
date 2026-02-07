import { defineApp, ErrorResponse } from "rwsdk/worker"
import { render, route } from "rwsdk/router"
import { createSessionCookie, generateSessionId, isValidSessionId } from "rwsdk/auth"

import { env } from "cloudflare:workers"

import { setCommonHeaders } from "@/app/headers"
import { Document } from "@/app/Document"
import { Home } from "@/app/pages"
import { About } from "./app/pages/about"
import { Write } from "@/app/pages/write"
import { Login } from "@/app/pages/login"
import { Recent } from "@/app/pages/recent"
import { UserProfile } from "@/app/pages/[user]"
import { ViewPost } from "@/app/pages/[user]/[slug]"
import { EditPost } from "@/app/pages/[user]/[slug]/edit"

import { client } from "@/app/oauth/oauth-client"
import { bareHandlePattern, handlePattern } from "@/app/shared/utils"

export type AppContext = {
	session: { did: string; handle: string | null } | null
}

const cookieName = "session_id"

export default defineApp([
	setCommonHeaders(),

	route("/oauth/client-metadata.json", () => {
		return new Response(JSON.stringify(client.clientMetadata), {
			headers: [["Content-Type", "application/json"]],
		})
	}),

	route("/oauth/jwks.json", () => {
		return new Response(JSON.stringify(client.jwks), {
			headers: [["Content-Type", "application/json"]],
		})
	}),

	route("/oauth/callback", async ({ ctx, request, response }) => {
		try {
			const url = new URL(request.url)
			const params = new URLSearchParams(url.search)
			const { session, state } = await client.callback(params)

			console.log(`got callback state: ${JSON.stringify(state)}`)

			let location: string = "/profile"
			if (state !== null) {
				try {
					const { redirect = null } = JSON.parse(state)
					if (typeof redirect === "string" && redirect.startsWith("/")) {
						location = redirect
					}
				} catch (err) {
					console.error(`failed to parse oauth callback state: ${err}`, state)
				}
			}

			// TODO: pass redirect path in state
			const sessionId = await generateSessionId({
				secretKey: env.AUTH_SECRET_KEY,
			})

			await env.WEB_SESSION_STORE.put(sessionId, JSON.stringify({ did: session.did }))

			const sessionCookie = createSessionCookie({
				name: cookieName,
				sessionId,
				maxAge: undefined,
			})

			return new Response(null, {
				status: 302,
				headers: [
					["Location", location],
					["Set-Cookie", sessionCookie],
				],
			})
		} catch (err) {
			console.error(err)
			throw new ErrorResponse(500, JSON.stringify(err))
		}
	}),

	route("/oauth/login", async ({ ctx, request }) => {
		const url = new URL(request.url)
		const params = new URLSearchParams(url.search)
		let handle = params.get("handle")
		if (handle === null) {
			throw new ErrorResponse(400, "missing 'handle' query parameter")
		}

		if (bareHandlePattern.test(handle)) {
			handle += ".bsky.social"
		} else if (!handlePattern.test(handle)) {
			throw new ErrorResponse(400, "invalid handle")
		}

		const redirect = params.get("redirect")
		const state = JSON.stringify({ redirect })

		console.log(`created oauth state: ${state}`)

		try {
			const url = await client.authorize(handle, {
				signal: request.signal,
				state: state,
				ui_locales: "en",
			})

			return new Response(null, {
				status: 302,
				headers: [["Location", url.href]],
			})
		} catch (err) {
			console.error(err)
			throw new ErrorResponse(500, JSON.stringify(err))
		}
	}),

	async ({ ctx, request }) => {
		ctx.session = null
		const sessionId = getSessionIdFromCookie(request)
		if (sessionId === null) {
			return
		}

		const isValid = await isValidSessionId({
			sessionId,
			secretKey: env.AUTH_SECRET_KEY,
		})

		if (!isValid) {
			throw new ErrorResponse(401, "Invalid session id")
		}

		const value = await env.WEB_SESSION_STORE.get(sessionId)
		if (value === null) {
			return
		}

		const { did } = JSON.parse(value)

		let handle: string | null = null
		try {
			const identity = await client.identityResolver.resolve(did)
			if (identity.handle !== "handle.invalid") {
				handle = identity.handle
			}
		} catch (err) {
			console.error(err)
		}

		ctx.session = { did, handle }
	},

	route("/logout", async ({ request, ctx }) => {
		const sessionId = getSessionIdFromCookie(request)
		if (sessionId !== null) {
			await env.WEB_SESSION_STORE.delete(sessionId)
		}

		if (ctx.session !== null) {
			await client.revoke(ctx.session.did)
		}

		const sessionCookie = `${cookieName}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
		return new Response(null, {
			status: 302,
			headers: [
				["Location", "/"],
				["Set-Cookie", sessionCookie],
			],
		})
	}),

	route("/profile", async ({ ctx }) => {
		if (ctx.session === null) {
			return new Response(null, {
				status: 302,
				headers: [["Location", "/login"]],
			})
		} else {
			const handle = ctx.session.handle ?? ctx.session.did
			return new Response(null, {
				status: 302,
				headers: [["Location", `/${handle}`]],
			})
		}
	}),

	render(
		Document,
		[
			route("/", Home),
			route("/about", About),
			route("/write", Write),
			route("/login", Login),
			route("/recent", Recent),
			route("/:user", UserProfile),
			route("/:user/:slug", ViewPost),
			route("/:user/:slug/edit", EditPost),
		],
		{ ssr: false },
	),
])

const getSessionIdFromCookie = (request: Request): string | null => {
	const cookieHeader = request.headers.get("Cookie")
	if (cookieHeader === null) {
		return null
	}

	for (const cookie of cookieHeader.split(";")) {
		const trimmedCookie = cookie.trim()
		const separatorIndex = trimmedCookie.indexOf("=")
		if (separatorIndex === -1) continue

		const key = trimmedCookie.slice(0, separatorIndex)
		const value = trimmedCookie.slice(separatorIndex + 1)

		if (key === cookieName) {
			return value
		}
	}

	return null
}
