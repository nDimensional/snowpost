import type mdast from "mdast";
import { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import { renderPost } from "@/app/shared/renderPost";

const samplePost: mdast.Root = {
	type: "root",
	children: [
		{
			type: "heading",
			depth: 1,
			children: [
				{
					type: "text",
					value: "This is what it's all about",
				},
			],
		},
		{
			type: "paragraph",
			children: [
				{
					type: "text",
					value: "There's a lot of neat stuff that happens in Paris...",
				},
			],
		},
		{
			type: "paragraph",
			children: [
				{
					type: "text",
					value: "",
				},
			],
		},
	],
};

const bskyApiUrl =
	"https://bsky.social/xrpc/com.atproto.identity.resolveHandle";
const plcApiUrl = " https://plc.directory";

async function resolveUser(
	user: string,
): Promise<{ did: string; handle: string | null } | null> {
	if (user.startsWith("did:")) {
		const did = user;
		let handle = await env.DID_TO_HANDLE.get(did);
		if (handle !== null) {
			return { did, handle };
		}

		if (did.startsWith("did:plc:")) {
			try {
				const res = await fetch(`${plcApiUrl}/${did}`);
				const { alsoKnownAs } = await res.json<{ alsoKnownAs: string[] }>();
				const url = new URL(alsoKnownAs[0]);
				handle = url.host;
			} catch (err) {
				console.error(err);
			}
		}

		if (handle !== null) {
			await env.DID_TO_HANDLE.put(did, handle, { expirationTtl: 60 * 60 * 24 });
			await env.HANDLE_TO_DID.put(handle, did, { expirationTtl: 60 * 60 * 24 });
		}

		return { did, handle };
	} else {
		const handle = user;
		let did = await env.HANDLE_TO_DID.get(handle);
		if (did !== null) {
			return { did, handle };
		}

		try {
			const res = await fetch(`${bskyApiUrl}?handle=${handle}`);
			const result = await res.json<{ did: string }>();
			did = result.did;
		} catch (err) {
			console.error(err);
			return null;
		}

		await env.HANDLE_TO_DID.put(handle, did, { expirationTtl: 60 * 60 * 24 });
		await env.DID_TO_HANDLE.put(did, handle, { expirationTtl: 60 * 60 * 24 });

		return { did, handle };
	}
}

async function getPost(
	identity: { did: string; handle: string | null },
	slug: string,
): Promise<{ root: mdast.Root }> {
	const key = `${identity.did}/${slug}/post.json`;
	const object = await env.R2.get(key);
	if (object === null) {
		// const user = identity.handle ?? identity.did;
		// return new Response(`Post ${user}/${slug} Not Found`, { status: 404 });
		return { root: samplePost };
	}

	return await object.json();
}

export async function ViewPost({
	ctx,
	params: { user, slug },
}: RequestInfo<{ user: string; slug: string }>) {
	const identity = await resolveUser(user);
	if (identity === null) {
		return new Response(`User ${user} Not Found`, { status: 404 });
	}

	const { root } = await getPost(identity, slug);

	const handle = identity.handle ?? identity.did;

	return (
		<div>
			<div className="flex flex-row gap-2 py-2">
				<a href={`/${handle}`}>{handle}</a>
				<span className="text-stone-500">/</span>
				<span>{slug}</span>
			</div>
			<pre>{JSON.stringify(import.meta.env)}</pre>
			<div className="content">{renderPost(root)}</div>
		</div>
	);
}
