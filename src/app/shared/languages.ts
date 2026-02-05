import type { LRParser } from "@lezer/lr"
import type { LRLanguage } from "@codemirror/language"

import { parser as javascriptParser } from "@lezer/javascript"
import { javascriptLanguage, jsxLanguage, typescriptLanguage, tsxLanguage } from "@codemirror/lang-javascript"

import { parser as rustParser } from "@lezer/rust"
import { rustLanguage } from "@codemirror/lang-rust"

import { parser as pythonParser } from "@lezer/python"
import { pythonLanguage } from "@codemirror/lang-python"

import { parser as htmlParser } from "@lezer/html"
import { htmlLanguage } from "@codemirror/lang-html"

import { parser as cssParser } from "@lezer/css"
import { cssLanguage } from "@codemirror/lang-css"

import { parser as goParser } from "@lezer/go"
import { goLanguage } from "@codemirror/lang-go"

import { parser as jsonParser } from "@lezer/json"
import { jsonLanguage } from "@codemirror/lang-json"

import { parser as lezerParser } from "@lezer/lezer"
import { lezerLanguage } from "@codemirror/lang-lezer"

import { SQLite } from "@codemirror/lang-sql"

export const parsers: Record<string, LRParser> = {
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

export const languages: Record<string, LRLanguage> = {
	javascript: javascriptLanguage,
	js: javascriptLanguage,
	jsx: jsxLanguage,
	typescript: typescriptLanguage,
	ts: typescriptLanguage,
	tsx: tsxLanguage,

	rust: rustLanguage,
	rs: rustLanguage,

	py: pythonLanguage,
	python: pythonLanguage,

	go: goLanguage,
	golang: goLanguage,

	css: cssLanguage,
	html: htmlLanguage,
	json: jsonLanguage,

	sql: SQLite.language,

	lezer: lezerLanguage,
}
