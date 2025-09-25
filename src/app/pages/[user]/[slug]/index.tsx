import { ErrorResponse, RequestInfo } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import type mdast from "mdast"
import { fromMarkdown } from "mdast-util-from-markdown"
import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver"

import { client } from "@/app/oauth/oauth-client"
import { parseTID, tidPattern } from "@/app/shared/utils"
import { updatePost } from "@/api/updatePost"
import { deletePost } from "@/api/deletePost"
import { getPostContent } from "@/api/utils"

async function getPostHTML(identity: IdentityInfo, slug: string): Promise<string | null> {
	// {
	// 	const key = `${identity.did}/${slug}/content.xhtml`;
	// 	const object = await env.R2.get(key);
	// 	if (object !== null) {
	// 		return await object.text();
	// 	}
	// }

	// {
	// 	const key = `${identity.did}/${slug}/content.json`;
	// 	const object = await env.R2.get(key);
	// 	if (object !== null) {
	// 		const mdAST = await object.json<mdast.Root>();
	// 		const hast = toHast(mdAST, {});
	// 		return toHtml(hast, {});
	// 	}
	// }

	{
		const key = `${identity.did}/${slug}/content.md`
		const object = await env.R2.get(key)
		if (object !== null) {
			const mdContent = await object.bytes()
			const mdAST = fromMarkdown(mdContent, "utf-8")
			const hast = toHast(mdAST, {})
			const html = toHtml(hast, {})

			await Promise.all([
				env.R2.put(`${identity.did}/${slug}/content.json`, JSON.stringify(mdAST), {
					httpMetadata: { contentType: "application/json" },
				}),

				env.R2.put(`${identity.did}/${slug}/content.xhtml`, html, {
					httpMetadata: { contentType: "application/xhtml+xml" },
				}),
			])

			return html
		}
	}

	{
		const { content: mdContent } = await getPostContent(identity.did, slug)
		const mdAST = fromMarkdown(mdContent, "utf-8")
		const hast = toHast(mdAST, {})
		const html = toHtml(hast, {})

		await Promise.all([
			env.R2.put(`${identity.did}/${slug}/content.md`, mdContent, {
				httpMetadata: { contentType: "text/markdown" },
			}),

			env.R2.put(`${identity.did}/${slug}/content.json`, JSON.stringify(mdAST), {
				httpMetadata: { contentType: "application/json" },
			}),

			env.R2.put(`${identity.did}/${slug}/content.xhtml`, html, {
				httpMetadata: { contentType: "application/xhtml+xml" },
			}),
		])

		return html
	}

	// return null
}

export async function ViewPost({
	ctx,
	params: { user, slug },
	request,
	response,
}: RequestInfo<{ user: string; slug: string }>) {
	if (!tidPattern.test(slug)) {
		throw new ErrorResponse(404, "Not found")
	}

	let identity: IdentityInfo
	try {
		identity = await client.identityResolver.resolve(user)
	} catch (err) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`)
	}

	if (request.method === "PUT") {
		if (ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized")
		} else if (ctx.session.did !== identity.did) {
			throw new ErrorResponse(403, "Forbidden")
		}

		return await updatePost(ctx.session, request, slug)
	} else if (request.method === "DELETE") {
		if (ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized")
		} else if (ctx.session.did !== identity.did) {
			throw new ErrorResponse(403, "Forbidden")
		}

		return await deletePost(ctx.session, request, slug)
	} else if (request.method !== "GET") {
		throw new ErrorResponse(405, "Method Not Allowed")
	}

	const cacheTag = `/${identity.did}/${slug}`
	// const cache = await caches.open("post");
	// const cachedResponse = await cache.match(cacheTag);
	// if (cachedResponse !== undefined) {
	// 	return cachedResponse;
	// }

	const content = await getPostHTML(identity, slug)
	if (content === null) {
		throw new ErrorResponse(404, `Post ${user}/${slug} Not Found`)
	}

	response.headers = new Headers({ ...response.headers })
	response.headers.set("Cache-Control", "public, max-age=86400")
	response.headers.set("Cache-Tag", cacheTag)
	// cache.put(cacheTag, response);

	const handle = identity.handle ?? identity.did
	const date = parseTID(slug)

	return (
		<>
			<nav className="flex flex-row py-2 justify-between">
				<span className="flex flex-row gap-1">
					<a href={`/${handle}`}>{handle}</a>
					<span className="text-stone-400">‧</span>
					<span>
						<span>{date.toLocaleDateString()}</span>
					</span>
				</span>
			</nav>
			<div className="content my-12" dangerouslySetInnerHTML={{ __html: content }} />
		</>
	)
}
