import type mdast from "mdast";
import type { Text } from "slate";
import type {
	PtBlockElement,
	PtDocument,
	PtInlineElement,
	PtText,
} from "./types.js";

export function loadDocument(content: string): PtDocument {
	return JSON.parse(content);
}

export function importAST(root: mdast.Root): PtDocument {
	return { content: Array.from(importBlockContent(root.children)) };
}

function* importBlockContent(
	children: Iterable<mdast.RootContent>,
): Iterable<PtBlockElement> {
	for (const child of children) {
		if (child.type === "paragraph") {
			yield {
				type: "paragraph",
				children: Array.from(importInlineContent(child.children)),
			};
		} else if (child.type === "heading") {
			if (child.depth === 1) {
				yield {
					type: "h1",
					children: Array.from(importInlineContent(child.children)),
				};
			} else if (child.depth === 2) {
				yield {
					type: "h2",
					children: Array.from(importInlineContent(child.children)),
				};
			} else if (child.depth === 3) {
				yield {
					type: "h3",
					children: Array.from(importInlineContent(child.children)),
				};
			} else {
				throw new Error(
					"invalid markdown heading: only h1, h2, and h3 are supported",
				);
			}
		} else if (child.type === "blockquote") {
			const [content] = child.children;
			if (content.type !== "paragraph") {
				throw new Error("invalid blockquote content: expected paragraph");
			}

			content.children;
		} else {
			throw new Error("invalid root content type");
		}
	}
}

function* importInlineContent(
	children: Iterable<mdast.PhrasingContent>,
	bold = false,
	italic = false,
): Iterable<PtInlineElement | PtText> {
	for (const child of children) {
		if (child.type === "text") {
			const leaf: Text = { text: child.value };
			if (bold) leaf.bold = true;
			if (italic) leaf.italic = true;
			yield leaf;
		} else if (child.type === "strong") {
			yield* importInlineContent(child.children, true, italic);
		} else if (child.type === "emphasis") {
			yield* importInlineContent(child.children, bold, true);
		} else {
			throw new Error("invalid inline content type");
		}
	}
}
