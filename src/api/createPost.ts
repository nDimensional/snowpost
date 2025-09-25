import { fromMarkdown } from "mdast-util-from-markdown"
import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"

import { ErrorResponse } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import { getTID } from "@/app/shared/utils"
import { writePostContent, extractPreviewText } from "@/api/utils"

export async function createPost({ did, handle }: { did: string; handle: string | null }, request: Request) {
	const contentType = request.headers.get("Content-Type")
	if (contentType !== "text/markdown") {
		throw new ErrorResponse(415, "Unsupported Media Type")
	}

	const mdContent = await request.bytes()
	const mdAST = fromMarkdown(mdContent, "utf-8")
	const hast = toHast(mdAST, {})
	const html = toHtml(hast, {})
	const previewText = extractPreviewText(mdAST)

	const date = new Date(Date.now())
	const slug = getTID(date)
	const createdAt = date.toISOString()

	await writePostContent(did, slug, mdContent, {
		signal: request.signal,
		createdAt,
	})

	await Promise.all([
		env.R2.put(`${did}/${slug}/content.md`, mdContent, {
			httpMetadata: { contentType: "text/markdown" },
		}),

		env.R2.put(`${did}/${slug}/content.json`, JSON.stringify(mdAST), {
			httpMetadata: { contentType: "application/json" },
		}),

		env.R2.put(`${did}/${slug}/content.xhtml`, html, {
			httpMetadata: { contentType: "application/xhtml+xml" },
		}),
	])

	try {
		const stmt = env.DB.prepare(
			"INSERT INTO POSTS (did, handle, slug, created_at, preview_text) VALUES (?, ?, ?, ?, ?)",
		).bind(did, handle, slug, createdAt, previewText)
		await stmt.run()
	} catch (err) {
		throw new ErrorResponse(500, `Failed to publish post: ${err}`)
	}

	const user = handle ?? did
	return new Response(null, {
		status: 201,
		headers: { Location: `/${user}/${slug}` },
	})
}
