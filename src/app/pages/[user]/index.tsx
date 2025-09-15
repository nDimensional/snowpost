import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { client } from "@/app/oauth/oauth-client";
import { createPost } from "@/api/createPost";
import { parseTID } from "@/app/shared/utils";

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

export async function UserProfile({
	ctx,
	params,
	request,
}: RequestInfo<{ user: string }>) {
	let identity: IdentityInfo;
	try {
		identity = await client.identityResolver.resolve(params.user);
	} catch (err) {
		console.error(err);
		throw new ErrorResponse(404, `Failed to resolve user ${params.user}`);
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

	const profileURL = `https://bsky.app/profile/${params.user}`;

	return (
		<div>
			<div className="my-12">
				<h1 className="text-2xl my-3">{handle}</h1>
				<div className="flex gap-2 items-center text-base">
					<a href={profileURL}>BlueSky profile</a>
					{identity.did === ctx.session?.did && (
						<>
							<span className="text-stone-400">∣</span>
							<span>
								<a href="/logout">sign out</a>
							</span>
						</>
					)}
				</div>
			</div>
			<hr />
			<div className="my-4">
				<ul className="flex flex-col gap-1">
					{postList.map(({ slug, previewText, createdAt }) => (
						<li key={slug} className="inline-flex items-start gap-2">
							<span className="text-stone-400 select-none">❅</span>
							<span className="flex-1">
								<a href={`/${handle}/${slug}`}>
									{previewText ? (
										<span>{previewText}</span>
									) : (
										<em>Untitled on {createdAt.toLocaleDateString()}</em>
									)}
								</a>
							</span>
							<span>
								{identity.did === ctx.session?.did && (
									<a href={`/${handle}/${slug}/edit`}>edit</a>
								)}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
