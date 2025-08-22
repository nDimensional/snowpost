import mdast from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";

import { ErrorResponse } from "rwsdk/worker";

import type { OAuthSession } from "atproto-oauth-client-cloudflare-workers/oauth-client";

import { Agent, BlobRef } from "@atproto/api";

import { client } from "@/app/oauth/oauth-client";
import { parseTID } from "@/app/shared/utils";

export async function deletePostContent(did: string, rkey: string) {
	const agent = await getAgent(did);

	try {
		const createRecordResponse = await agent.com.atproto.repo.deleteRecord({
			repo: did,
			collection: "st.snowpo.post",
			rkey: rkey,
		});

		if (!createRecordResponse.success) {
			throw new Error("post failed");
		}
	} catch (err) {
		throw new ErrorResponse(502, `Failed to create record: ${err}`);
	}
}

export async function writePostContent(
	did: string,
	rkey: string,
	content: string | Uint8Array,
	options: {
		signal?: AbortSignal;
		createdAt?: string;
		updatedAt?: string;
	} = {},
) {
	const agent = await getAgent(did);

	let blob: BlobRef;
	try {
		const uploadBlobResponse = await agent.uploadBlob(content, {
			signal: options.signal,
			headers: { "Content-Type": "text/markdown" },
		});

		if (!uploadBlobResponse.success) {
			throw new Error("post failed");
		}

		blob = uploadBlobResponse.data.blob;
	} catch (err) {
		throw new ErrorResponse(502, `Failed to upload blob: ${err}`);
	}

	try {
		const putRecordResponse = await agent.com.atproto.repo.putRecord({
			repo: did,
			collection: "st.snowpo.post",
			rkey: rkey,
			record: {
				$type: "st.snowpo.post",
				content: blob.ipld(),
				createdAt: options.createdAt ?? parseTID(rkey).toISOString(),
				updatedAt: options.updatedAt,
			},
		});

		if (!putRecordResponse.success) {
			throw new Error("post failed");
		}
	} catch (err) {
		throw new ErrorResponse(502, `Failed to create record: ${err}`);
	}
}

async function getAgent(did: string) {
	let oauthSession: OAuthSession;
	try {
		oauthSession = await client.restore(did);
	} catch (err) {
		throw new ErrorResponse(401, "Unauthorized");
	}

	return new Agent(oauthSession);
}

export function extractPreviewText(root: mdast.Nodes) {
	const firstHeading = getFirst(findChild(root, "heading"));
	if (firstHeading !== null) {
		return mdastToString(firstHeading);
	}

	const firstParagraph = getFirst(findChild(root, "paragraph"));
	if (firstParagraph !== null) {
		return mdastToString(firstHeading);
	}

	return null;
}

const isParent = (node: mdast.Node): node is mdast.Parent =>
	Array.isArray((node as any).children);

function* findChild<T extends mdast.Nodes = mdast.Nodes>(
	root: mdast.Nodes,
	type: string,
): Iterable<T> {
	if (root.type === type) {
		yield root as T;
	} else if (isParent(root)) {
		for (const child of root.children) {
			if (child.type === type) {
				yield child as T;
			} else if (isParent(child)) {
				yield* findChild(child, type);
			}
		}
	}
}

function getFirst<T>(iter: Iterable<T>): T | null {
	for (const elem of iter) {
		return elem;
	}
	return null;
}
