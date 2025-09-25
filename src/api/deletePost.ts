import { ErrorResponse } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import { deletePostContent } from "@/api/utils"

export async function deletePost(
	{ did, handle }: { did: string; handle: string | null },
	request: Request,
	slug: string,
) {
	await deletePostContent(did, slug)

	try {
		const stmt = env.DB.prepare("DELETE FROM posts WHERE did = ? AND slug = ?").bind(did, slug)

		await stmt.run()
	} catch (err) {
		throw new ErrorResponse(500, `Failed to update post: ${err}`)
	}

	await Promise.all([
		env.R2.delete(`${did}/${slug}/content.md`),
		env.R2.delete(`${did}/${slug}/content.json`),
		env.R2.delete(`${did}/${slug}/content.xhtml`),
	])

	const user = handle ?? did
	return new Response(null, {
		status: 200,
		headers: { Location: `/${user}` },
	})
}
