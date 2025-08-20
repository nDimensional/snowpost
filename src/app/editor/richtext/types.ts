import type { Descendant } from "slate";

export type PtParagraph = {
	type: "paragraph";
	children: (PtInlineElement | PtText)[];
};

export type PtBlockquote = {
	type: "blockquote";
	children: (PtInlineElement | PtText)[];
};

export type PtHeadingOne = {
	type: "h1";
	children: (PtInlineElement | PtText)[];
};

export type PtHeadingTwo = {
	type: "h2";
	children: (PtInlineElement | PtText)[];
};

export type PtHeadingThree = {
	type: "h3";
	children: (PtInlineElement | PtText)[];
};

// export type PtOrderedList = { type: "ol"; children: PtListItem[] }
// export type PtUnorderedList = { type: "ul"; children: PtListItem[] }
// export type PtListItem = { type: "li"; children: PtText }

export type PtText = { text: string; bold?: true; italic?: true };

export type PtBlockElement =
	| PtParagraph
	| PtHeadingOne
	| PtHeadingTwo
	| PtHeadingThree
	| PtBlockquote;

export const isBlockElement = (element: PtElement): element is PtBlockElement =>
	element.type === "paragraph" ||
	element.type === "blockquote" ||
	element.type === "h1" ||
	element.type === "h2" ||
	element.type === "h3";

export type PtInlineElement = PtLink;

export const isInlineElement = (
	element: PtElement,
): element is PtInlineElement => element.type === "link";

export type PtLink = {
	type: "link";
	url: string;
	title?: string;
	children: PtText[];
};

// export type PtInlineCode = {
// 	type: "inlineCode"
// 	value: string
// }

export type PtElement = PtBlockElement | PtInlineElement;

export type PtDocument = { content: Descendant[] };
