import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import { resolveUser } from "@/app/shared/resolveUser";
import { handlePattern } from "@/app/shared/utils";

async function getPostList(identity: {
	did: string;
	handle: string | null;
}): Promise<{ slug: string }[]> {
	const result = await env.DB.prepare(
		"SELECT slug FROM posts WHERE did = ? ORDER BY slug DESC",
	)
		.bind(identity.did)
		.all<{ slug: string }>();
	return result.results;
}

export async function Profile({
	ctx,
	params: { user },
}: RequestInfo<{ user: string }>) {
	if (!handlePattern.test(user)) {
		throw new ErrorResponse(400, "Invalid handle");
	}

	const identity = await resolveUser(user);
	if (identity === null) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	const postList = await getPostList(identity);

	const handle = identity.handle ?? identity.did;

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
