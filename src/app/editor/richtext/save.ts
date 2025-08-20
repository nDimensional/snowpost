import type mdast from "mdast";
import { Descendant, Element, Text } from "slate";

import {
	isInlineElement,
	type PtDocument,
	type PtInlineElement,
} from "./types.js";
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
			// Block elements
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
			} else if (isInlineElement(child)) {
				console.error("encountered unexpected inline child element", child);
				yield {
					type: "paragraph",
					children: Array.from(exportInlineContent([child])),
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

type MarkStackNode = mdast.Strong | mdast.Emphasis;
type MarkStackNodeType = MarkStackNode["type"];

class MarkStack {
	#stack: MarkStackNode[] = [];

	public get length() {
		return this.#stack.length;
	}

	public isItalic() {
		return this.#stack.some((node) => node.type === "emphasis");
	}

	public isBold() {
		return this.#stack.some((node) => node.type === "strong");
	}

	public *push(text: Text): Iterable<MarkStackNode | mdast.Text> {
		if (text.bold && text.italic) {
			this.pushMark("strong");
			this.pushMark("emphasis");
			this.pushText(text.text);
		} else if (text.bold && !text.italic) {
			yield* this.flushMark("emphasis");
			this.pushMark("strong");
			this.pushText(text.text);
		} else if (!text.bold && text.italic) {
			yield* this.flushMark("strong");
			this.pushMark("emphasis");
			this.pushText(text.text);
		} else if (!text.bold && !text.italic) {
			yield* this.flushMark("strong");
			yield* this.flushMark("emphasis");
			yield { type: "text", value: text.text };
		}
	}

	private pushMark(type: MarkStackNodeType) {
		if (this.#stack.some((node) => node.type === type)) {
			return;
		}

		const node: MarkStackNode = { type, children: [] };
		if (this.#stack.length > 0) {
			this.#stack[this.#stack.length - 1].children.push(node);
		}
		this.#stack.push(node);
	}

	private pushText(value: string) {
		this.#stack[this.#stack.length - 1].children.push({ type: "text", value });
	}

	private *flushMark(type: MarkStackNodeType): Iterable<MarkStackNode> {
		const index = this.#stack.findIndex((node) => node.type === type);
		if (index === -1) {
			return;
		}

		const [root] = this.#stack.splice(index, this.#stack.length - index);
		if (index === 0) {
			yield root;
		}
	}

	public *flush(): Iterable<MarkStackNode> {
		if (this.#stack.length > 0) {
			const [root] = this.#stack.splice(0, this.#stack.length);
			yield root;
		}
	}
}

function* exportInlineContent(
	children: (PtInlineElement | Text)[],
): Iterable<mdast.Strong | mdast.Emphasis | mdast.Text | mdast.Link> {
	const stack = new MarkStack();

	for (const child of children) {
		if (Element.isElement(child)) {
			if (child.type === "link") {
				const link: mdast.Link = { type: "link", children: [], url: "" };
			} else {
				console.error("encountered unexpected block element", child);
			}
		} else if (Text.isText(child)) {
			yield* stack.push(child);
		} else {
			signalInvalidType(child);
		}
	}

	yield* stack.flush();
}

export function saveDocument(doc: PtDocument): string {
	return JSON.stringify(doc);
}
