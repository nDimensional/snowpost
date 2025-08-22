import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { Page } from "@/app/pages/Page";
import { client } from "@/app/oauth/oauth-client";
import { createPost } from "@/api/createPost";
import { parseTID } from "../shared/utils";

async function getPostList(
	identity: IdentityInfo,
): Promise<{ slug: string; createdAt: Date; previewText: string | null }[]> {
	const result = await env.DB.prepare(
		"SELECT slug, created_at, preview_text FROM posts WHERE did = ? ORDER BY slug DESC",
	)
		.bind(identity.did)
		.all<{
			slug: string;
			created_at: string | null;
			preview_text: string | null;
		}>();

	return result.results.map(({ slug, created_at, preview_text }) => ({
		slug,
		createdAt: created_at ? new Date(created_at) : parseTID(slug),
		previewText: preview_text,
	}));
}

export async function Profile({
	ctx,
	params: { user },
	request,
}: RequestInfo<{ user: string }>) {
	let identity: IdentityInfo;
	try {
		identity = await client.identityResolver.resolve(user);
	} catch (err) {
		console.error(err);
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	if (request.method === "POST") {
		if (ctx.session === null) {
			throw new ErrorResponse(401, "Unauthorized");
		} else if (ctx.session.did !== identity.did) {
			throw new ErrorResponse(403, "Forbidden");
		}

		return await createPost(ctx.session, request);
	} else if (request.method !== "GET") {
		throw new ErrorResponse(405, "Method Not Allowed");
	}

	const postList = await getPostList(identity);

	const handle =
		identity.handle === "handle.invalid" ? identity.did : identity.handle;

	const profileURL = `https://bsky.app/profile/${user}`;

	return (
		<Page session={ctx.session}>
			<div className="mt-16 mb-12">
				<div className="my-8">
					<a href={profileURL}>{user}</a>
				</div>
				<ul className="flex flex-col">
					{postList.map(({ slug, previewText, createdAt }) => (
						<li key={slug} className="inline-flex gap-2">
							<span className="text-stone-400">{handle}</span>
							<span className="text-stone-400">⟩</span>
							<a href={`/${handle}/${slug}`}>
								{previewText ? (
									<span>{previewText}</span>
								) : (
									<em>Untitled on {createdAt.toLocaleDateString()}</em>
								)}
							</a>
						</li>
					))}
				</ul>
			</div>
		</Page>
	);
}
