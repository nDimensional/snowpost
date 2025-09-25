import { RequestInfo } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import { parseTID } from "@/app/shared/utils"

async function getRecentPosts(limit = 20): Promise<
	{
		did: string
		handle: string | null
		slug: string
		createdAt: Date
		previewText: string | null
	}[]
> {
	const sql = `
		SELECT did, handle, slug, preview_text FROM posts ORDER BY slug DESC LIMIT ?
  `

	const result = await env.DB.prepare(sql).bind(limit).all<{
		did: string
		handle: string | null
		slug: string
		preview_text: string | null
		created_at: string | null
	}>()

	return result.results.map(({ created_at, preview_text, ...rest }) => ({
		...rest,
		previewText: preview_text,
		createdAt: created_at ? new Date(created_at) : parseTID(rest.slug),
	}))
}

export async function Recent({}: RequestInfo) {
	const postList = await getRecentPosts()

	return (
		<div className="flex flex-col gap-1 mt-16 mb-12 content">
			{postList.map(({ did, handle, slug, previewText, createdAt }) => {
				const user = handle ?? did
				return (
					<div className="flex flex-row gap-1" key={`${did}/slug`}>
						<span className="text-stone-400">{user}</span>
						<span className="text-stone-400">⟩</span>
						<a href={`/${handle}/${slug}`}>
							{previewText ? <span>{previewText}</span> : <em>Untitled on {createdAt.toLocaleDateString()}</em>}
						</a>
					</div>
				)
			})}
		</div>
	)
}
