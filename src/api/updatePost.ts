import { fromMarkdown } from "mdast-util-from-markdown"
import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"

import { ErrorResponse } from "rwsdk/worker"
import { env } from "cloudflare:workers"

import { parseTID } from "@/app/shared/utils"
import { writePostContent, extractPreviewText } from "@/api/utils"

export async function updatePost(
	{ did, handle }: { did: string; handle: string | null },
	request: Request,
	slug: string,
) {
	const contentType = request.headers.get("Content-Type")
	if (contentType !== "text/markdown") {
		throw new ErrorResponse(415, "Unsupported Media Type")
	}

	const mdContent = await request.bytes()
	const mdast = fromMarkdown(mdContent, "utf-8")
	const hast = toHast(mdast, {})
	const html = toHtml(hast, {})
	const previewText = extractPreviewText(mdast)

	const updatedAt = new Date().toISOString()
	const createdAt = parseTID(slug).toISOString()

	await writePostContent(did, slug, mdContent, {
		signal: request.signal,
		createdAt,
		updatedAt,
	})

	await Promise.all([
		env.R2.put(`${did}/${slug}/content.md`, mdContent, {
			httpMetadata: { contentType: "text/markdown" },
		}),

		env.R2.put(`${did}/${slug}/content.json`, JSON.stringify(mdast), {
			httpMetadata: { contentType: "application/json" },
		}),

		env.R2.put(`${did}/${slug}/content.xhtml`, html, {
			httpMetadata: { contentType: "application/xhtml+xml" },
		}),
	])

	try {
		const stmt = env.DB.prepare(
			`
  		INSERT INTO posts (did, slug, handle, created_at, updated_at, preview_text)
  		VALUES (?, ?, ?, ?, ?, ?)
  		ON CONFLICT(did, slug) DO UPDATE SET
        handle = excluded.handle,
        updated_at = excluded.updated_at,
        preview_text = excluded.preview_text
      `,
		).bind(did, slug, handle, createdAt, updatedAt, previewText)

		await stmt.run()
	} catch (err) {
		throw new ErrorResponse(500, `Failed to update post: ${err}`)
	}

	const user = handle ?? did
	return new Response(null, {
		status: 201,
		headers: { Location: `/${user}/${slug}` },
	})
}
