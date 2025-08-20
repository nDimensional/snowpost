import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { Page } from "@/app/pages/Page";
import { renderPost } from "@/app/shared/renderPost";
import { client } from "@/app/oauth/oauth-client";
import { parseClock } from "@/app/shared/utils";

async function getPost(
	user: string,
	slug: string,
	identity: IdentityInfo,
): Promise<string> {
	const key = `${identity.did}/${slug}/content.xhtml`;
	const object = await env.R2.get(key);
	if (object === null) {
		throw new ErrorResponse(404, `Post ${user}/${slug} Not Found`);
	}

	return await object.text();
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
	const date = parseClock(slug).toLocaleDateString();

	return (
		<Page session={ctx.session}>
			<nav className="flex flex-row py-2 justify-between">
				<span className="flex flex-row gap-1">
					<a href={`/${handle}`}>{handle}</a>
					<span className="text-stone-400">‧</span>
					<span>
						<span>{date}</span>
					</span>
				</span>
				{ctx.session?.did === identity.did && (
					<span>
						<span className="flex-1 inline-flex justify-end">
							<a href={`/${user}/${slug}/edit`}>edit</a>
						</span>
					</span>
				)}
			</nav>
			<div
				className="content my-12"
				dangerouslySetInnerHTML={{ __html: post }}
			/>
		</Page>
	);
}
