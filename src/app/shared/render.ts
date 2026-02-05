import assert from "node:assert"

import type mdast from "mdast"
import type hast from "hast"

import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"
import { fromLezer } from "hast-util-from-lezer"

import { parsers } from "@/app/shared/languages"

export function mdastToHTML(mdAST: mdast.Root): string {
	const hast = toHast(mdAST, {
		handlers: {
			code: (state, node: mdast.Code, parents) => {
				const children: hast.ElementContent[] = []

				if (typeof node.lang === "string" && node.lang in parsers) {
					const tree = parsers[node.lang].parse(node.value)
					const root = fromLezer(node.value, tree)
					for (const child of root.children) {
						assert(child.type !== "doctype")
						children.push(child)
					}
				} else {
					children.push({ type: "text", value: node.value })
				}

				return {
					type: "element",
					tagName: "pre",
					properties: { "data-language": node.lang },
					children: [
						{
							type: "element",
							tagName: "code",
							properties: {},
							children: children,
						},
					],
				}
			},
		},
	})

	return toHtml(hast, {})
}
