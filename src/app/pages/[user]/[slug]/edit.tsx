import { ErrorResponse, RequestInfo } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import { Agent, BlobRef } from "@atproto/api"
import { CID } from "multiformats/cid"

import type { IdentityInfo } from "atproto-oauth-client-cloudflare-workers/identity-resolver"
import type { OAuthSession } from "atproto-oauth-client-cloudflare-workers/oauth-client"

import { App } from "@/app/editor/markdown/App"
import { client } from "@/app/oauth/oauth-client"
import { tidPattern } from "@/app/shared/utils"

export async function EditPost({ ctx, params: { user, slug } }: RequestInfo<{ user: string; slug: string }>) {
	if (ctx.session === null) {
		throw new ErrorResponse(401, "Unauthorized")
	}

	if (!tidPattern.test(slug)) {
		throw new ErrorResponse(404, "Not found")
	}

	let identity: IdentityInfo
	try {
		identity = await client.identityResolver.resolve(user)
	} catch (err) {
		throw new ErrorResponse(404, `Failed to resolve user ${user}`)
	}

	if (identity.did !== ctx.session.did) {
		throw new ErrorResponse(403, "Forbidden")
	}

	let oauthSession: OAuthSession
	try {
		oauthSession = await client.restore(ctx.session.did)
	} catch (err) {
		throw new ErrorResponse(401, "Unauthorized")
	}

	const agent = new Agent(oauthSession)
	if (agent.did !== identity.did) {
		throw new ErrorResponse(401, "Unauthorized")
	}

	const postRecordResponse = await agent.com.atproto.repo.getRecord({
		repo: agent.did,
		collection: "st.snowpo.post",
		rkey: slug,
	})

	if (!postRecordResponse.success) {
		throw new ErrorResponse(502, "Failed to fetch post record from PDS")
	}

	const postRecord = postRecordResponse.data.value as {
		$type: "st.snowpo.post"
		content: {
			$type: "blob"
			ref: CID
			mimeType: string
			size: number
		}
		createdAt: string
		updatedAt?: string
	}

	const postContentRef = postRecord.content.ref

	let initialValue: string
	try {
		const postContentResponse = await agent.com.atproto.sync.getBlob({
			did: agent.did,
			cid: postContentRef.toString(),
		})

		if (!postContentResponse.success) {
			throw new ErrorResponse(502, "Failed to fetch post content from PDS")
		}

		const { data } = postContentResponse
		initialValue = typeof data === "string" ? data : new TextDecoder().decode(data)
	} catch (err) {
		throw new ErrorResponse(500, `Failed to fetch record content: ${err}`)
	}

	return <App session={ctx.session} tid={slug} initialValue={initialValue} />
}
