import type mdast from "mdast";
import { Descendant, Element, Text } from "slate";

import type { PtDocument, PtInlineElement } from "./types.js";
import { signalInvalidType } from "./utils.js";

export function exportAST(content: Descendant[]): mdast.Root {
	const rootContent = Array.from(exportBlockContent(content));
	return { type: "root", children: rootContent };
}

function* exportBlockContent(
	children: Descendant[],
): Iterable<mdast.Paragraph | mdast.Blockquote | mdast.Heading> {
	for (const child of children) {
		if (Element.isElement(child)) {
			if (child.type === "paragraph") {
				yield {
					type: "paragraph",
					children: Array.from(exportInlineContent(child.children)),
				};
			} else if (child.type === "blockquote") {
				yield {
					type: "blockquote",
					children: [
						{
							type: "paragraph",
							children: Array.from(exportInlineContent(child.children)),
						},
					],
				};
			} else if (child.type === "h1") {
				yield {
					type: "heading",
					depth: 1,
					children: Array.from(exportInlineContent(child.children)),
				};
			} else if (child.type === "h2") {
				yield {
					type: "heading",
					depth: 2,
					children: Array.from(exportInlineContent(child.children)),
				};
			} else if (child.type === "h3") {
				yield {
					type: "heading",
					depth: 3,
					children: Array.from(exportInlineContent(child.children)),
				};
			} else {
				signalInvalidType(child);
			}
		} else if (Text.isText(child)) {
			throw new Error("encountered text element in root document");
		} else {
			signalInvalidType(child);
		}
	}
}

class Stack {
	#stack: (mdast.Strong | mdast.Emphasis)[] = [];

	push(text: mdast.Text) {
		this.#stack[this.#stack.length - 1].children.push(text);
	}
}

function* exportInlineContent(
	children: (Text | PtInlineElement)[],
): Iterable<mdast.Strong | mdast.Emphasis | mdast.Text> {
	const stack: (mdast.Strong | mdast.Emphasis)[] = [];
	const pushText = (text: mdast.Text) =>
		stack[stack.length - 1].children.push(text);

	let isItalic = false;
	let isBold = false;

	for (const child of children) {
		if (Text.isText(child)) {
			const text: mdast.Text = { type: "text", value: child.text };

			if (child.bold && child.italic) {
				if (isBold && isItalic) {
					pushText(text);
				} else if (isBold) {
					stack.push({ type: "emphasis", children: [text] });
				} else if (isItalic) {
					stack.push({ type: "strong", children: [text] });
				} else {
					stack.push({ type: "strong", children: [] });
					stack.push({ type: "emphasis", children: [text] });
				}
			} else if (child.bold && !child.italic) {
				if (isBold && isItalic) {
					if (stack[0].type === "strong" && stack[1].type === "emphasis") {
						const emphasis = stack.pop()!;
						stack[0].children.push(emphasis);
						stack[0].children.push(text);
					} else if (
						stack[0].type === "emphasis" &&
						stack[1].type === "strong"
					) {
						const strong = stack.pop()!;
						const emphasis = stack.pop()!;
						emphasis.children.push(strong);
						yield emphasis;
						stack.push({ type: "strong", children: [text] });
					} else {
						throw new Error("internal error - invalid stack");
					}
				} else if (isBold) {
					pushText(text);
				} else if (isItalic) {
					yield stack.pop()!;
					stack.push({ type: "strong", children: [text] });
				} else {
					stack.push({ type: "strong", children: [text] });
				}
			} else if (!child.bold && child.italic) {
				if (isBold && isItalic) {
					if (stack[0].type === "strong" && stack[1].type === "emphasis") {
						const emphasis = stack.pop()!;
						const strong = stack.pop()!;
						strong.children.push(emphasis);
						yield strong;
						stack.push({ type: "emphasis", children: [text] });
					} else if (
						stack[0].type === "emphasis" &&
						stack[1].type === "strong"
					) {
						const strong = stack.pop()!;
						stack[0].children.push(strong);
						stack[0].children.push(text);
					} else {
						throw new Error("internal error - invalid stack");
					}
				} else if (isBold) {
					yield stack.pop()!;
					stack.push({ type: "emphasis", children: [text] });
				} else if (isItalic) {
					pushText(text);
				} else {
					stack.push({ type: "emphasis", children: [text] });
				}
			} else if (!child.bold && !child.italic) {
				if (isBold && isItalic) {
					const inner = stack.pop()!;
					const outer = stack.pop()!;
					outer.children.push(inner);
					yield outer;
					yield text;
				} else if (isBold) {
					yield stack.pop()!;
					yield text;
				} else if (isItalic) {
					yield stack.pop()!;
					yield text;
				} else {
					yield text;
				}
			}

			isBold = child.bold ?? false;
			isItalic = child.italic ?? false;
		} else {
			signalInvalidType(child);
		}
	}

	if (stack.length === 2) {
		const inner = stack.pop()!;
		const outer = stack.pop()!;
		outer.children.push(inner);
		yield outer;
	} else if (stack.length === 1) {
		yield stack.pop()!;
	}
}

export function saveDocument(doc: PtDocument): string {
	return JSON.stringify(doc);
}
