import type mdast from "mdast";
import { ErrorResponse, RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import { renderPost } from "@/app/shared/renderPost";
import { resolveUser } from "@/app/shared/resolveUser";

async function getPost(
	identity: { did: string; handle: string | null },
	slug: string,
): Promise<{ date: string; root: mdast.Root }> {
	const key = `${identity.did}/${slug}/post.json`;
	const object = await env.R2.get(key);
	if (object === null) {
		const user = identity.handle ?? identity.did;
		throw new ErrorResponse(404, `Post ${user}/${slug} Not Found`);
	}

	return await object.json();
}

export async function ViewPost({
	ctx,
	params: { user, slug },
}: RequestInfo<{ user: string; slug: string }>) {
	const identity = await resolveUser(user);
	if (identity === null) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`);
	}

	const post = await getPost(identity, slug);

	const handle = identity.handle ?? identity.did;
	const date = new Date(post.date).toLocaleDateString();

	try {
		return (
			<div>
				<div className="flex flex-row gap-2 py-2">
					<a href={`/${handle}`}>{handle}</a>
					<span className="text-stone-500">|</span>
					<span>{date}</span>
					{identity.did === ctx.session?.did && (
						<>
							<span className="text-stone-500">|</span>
							<a href={`/${user}/${slug}/edit`}>edit</a>
						</>
					)}
				</div>
				<div className="content">{renderPost(post.root)}</div>
			</div>
		);
	} catch (err) {
		throw new ErrorResponse(500, `Error rendering post - ${err}`);
	}
}
