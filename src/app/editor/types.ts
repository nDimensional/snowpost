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

export type PtText = { text: string; bold?: boolean; italic?: boolean };

export type PtBlockElement =
	| PtParagraph
	| PtHeadingOne
	| PtHeadingTwo
	| PtHeadingThree
	| PtBlockquote;

// export type PtInlineElement = PtEmphasis | PtStrong | PtLink | PtInlineCode
// export type PtEmphasis = { type: "emphasis"; children: (PtInlineElement | PtText)[] }
// export type PtStrong = { type: "strong"; children: (PtInlineElement | PtText)[] }
// export type PtLink = {
// 	type: "link"
// 	url: string
// 	title?: string
// 	children: (PtInlineElement | PtText)[]
// }

// export type PtInlineCode = {
// 	type: "inlineCode"
// 	value: string
// }

export type PtInlineElement = never;

export type PtElement = PtBlockElement | PtInlineElement;

export type PtDocument = { content: Descendant[] };
