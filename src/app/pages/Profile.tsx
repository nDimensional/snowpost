import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver";

import { client } from "@/app/oauth/oauth-client";

async function getPostList(
	identity: IdentityInfo,
): Promise<{ slug: string }[]> {
	const result = await env.DB.prepare(
		"SELECT slug FROM posts WHERE did = ? ORDER BY slug DESC",
	)
		.bind(identity.did)
		.all<{ slug: string }>();
	return result.results;
}

export async function Profile({
	params: { user },
}: RequestInfo<{ user: string }>) {
	let identity: IdentityInfo;
	try {
		identity = await client.identityResolver.resolve(user);
	} catch (err) {
		console.error(err);
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	const postList = await getPostList(identity);

	const handle =
		identity.handle === "handle.invalid" ? identity.did : identity.handle;

	return (
		<div>
			<div className="flex flex-row gap-2 py-2">
				<ul className="flex flex-col ">
					<li className="inline-flex gap-1">
						<a href={`/${handle}`}>{handle}</a>
					</li>
					{postList.map(({ slug }) => {
						return (
							<li key={slug} className="inline-flex gap-1">
								<span className="text-stone-400">{handle}</span>
								<span className="text-stone-400">/</span>
								<a href={`/${handle}/${slug}`}>
									<span>{slug}</span>
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
