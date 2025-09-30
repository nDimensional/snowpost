import assert from "node:assert"

import type mdast from "mdast"
import type hast from "hast"

import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"
import { fromLezer } from "hast-util-from-lezer"

import { LRParser } from "@lezer/lr"
import { parser as javascriptParser } from "@lezer/javascript"
import { parser as rustParser } from "@lezer/rust"
import { parser as pythonParser } from "@lezer/python"
import { parser as htmlParser } from "@lezer/html"
import { parser as cssParser } from "@lezer/css"
import { parser as goParser } from "@lezer/go"
import { parser as jsonParser } from "@lezer/json"
import { parser as lezerParser } from "@lezer/lezer"
import { SQLite } from "@codemirror/lang-sql"

const parsers: Record<string, LRParser> = {
	javascript: javascriptParser,
	js: javascriptParser,
	jsx: javascriptParser.configure({ dialect: "jsx" }),
	typescript: javascriptParser.configure({ dialect: "ts" }),
	ts: javascriptParser.configure({ dialect: "ts" }),
	tsx: javascriptParser.configure({ dialect: "ts jsx" }),

	rust: rustParser,
	rs: rustParser,

	py: pythonParser,
	python: pythonParser,

	go: goParser,

	css: cssParser,
	html: htmlParser,
	json: jsonParser,

	sql: SQLite.language.parser,

	lezer: lezerParser,
}

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
