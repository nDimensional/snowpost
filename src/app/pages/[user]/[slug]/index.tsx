import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { client } from "@/app/oauth/oauth-client";
import { parseTID, tidPattern } from "@/app/shared/utils";
import { updatePost } from "@/api/updatePost";
import { deletePost } from "@/api/deletePost";

async function getPostContent(
	identity: IdentityInfo,
	slug: string,
): Promise<string | null> {
	const key = `${identity.did}/${slug}/content.xhtml`;
	const object = await env.R2.get(key);
	if (object === null) {
		return null;
	}

	return await object.text();
}

export async function ViewPost({
	ctx,
	params: { user, slug },
	request,
	response,
}: RequestInfo<{ user: string; slug: string }>) {
	if (!tidPattern.test(slug)) {
		throw new ErrorResponse(404, "Not found");
	}

	let identity: IdentityInfo;
	try {
		identity = await client.identityResolver.resolve(user);
	} catch (err) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	if (request.method === "PUT") {
		if (ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized");
		} else if (ctx.session.did !== identity.did) {
			throw new ErrorResponse(403, "Forbidden");
		}

		return await updatePost(ctx.session, request, slug);
	} else if (request.method === "DELETE") {
		if (ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized");
		} else if (ctx.session.did !== identity.did) {
			throw new ErrorResponse(403, "Forbidden");
		}

		return await deletePost(ctx.session, request, slug);
	} else if (request.method !== "GET") {
		throw new ErrorResponse(405, "Method Not Allowed");
	}

	const cacheTag = `/${identity.did}/${slug}`;
	// const cache = await caches.open("post");
	// const cachedResponse = await cache.match(cacheTag);
	// if (cachedResponse !== undefined) {
	// 	return cachedResponse;
	// }

	const content = await getPostContent(identity, slug);
	if (content === null) {
		throw new ErrorResponse(404, `Post ${user}/${slug} Not Found`);
	}

	response.headers = new Headers({ ...response.headers });
	response.headers.set("Cache-Control", "public, max-age=86400");
	response.headers.set("Cache-Tag", cacheTag);
	// cache.put(cacheTag, response);

	const handle = identity.handle ?? identity.did;
	const date = parseTID(slug);

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
			<div
				className="content my-12"
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		</>
	);
}
