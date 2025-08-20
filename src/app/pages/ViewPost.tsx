import type mdast from "mdast";
import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { renderPost } from "@/app/shared/renderPost";
import { client } from "@/app/oauth/oauth-client";

async function getPost(
	user: string,
	slug: string,
	identity: IdentityInfo,
): Promise<{ user: string; date: string; root: mdast.Root }> {
	const key = `${identity.did}/${slug}/post.json`;
	const object = await env.R2.get(key);
	if (object === null) {
		const user =
			identity.handle === "handle.invalid" ? identity.handle : identity.did;
		throw new ErrorResponse(404, `Post ${user}/${slug} Not Found`);
	}

	return await object.json();
}

export async function ViewPost({
	ctx,
	params: { user, slug },
}: RequestInfo<{ user: string; slug: string }>) {
	let identity: IdentityInfo;
	try {
		identity = await client.identityResolver.resolve(user);
	} catch (err) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	const post = await getPost(user, slug, identity);

	const handle = identity.handle ?? identity.did;
	const date = new Date(post.date).toLocaleDateString();

	try {
		return (
			<div>
				<div className="inline-flex flex-row gap-2 py-2">
					<a href={`/${handle}`}>{handle}</a>
					<span className="text-stone-400">‧</span>
					<span>{date}</span>
					{identity.did === ctx.session?.did && (
						<span className="flex-1 inline-flex justify-end">
							<a href={`/${user}/${slug}/edit`}>edit</a>
						</span>
					)}
				</div>
				<div className="content">{renderPost(post.root)}</div>
			</div>
		);
	} catch (err) {
		throw new ErrorResponse(500, `Error rendering post - ${err}`);
	}
}
