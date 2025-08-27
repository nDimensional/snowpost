// import React, { PropsWithChildren, MouseEvent } from "react";
// import { Editor, Element, Text, Transforms } from "slate";
// import { useSlate } from "slate-react";

// import type { PtBlockElement } from "./types.js";

// interface BaseProps {
// 	className?: string;
// 	[key: string]: unknown;
// }

// export const Button = React.forwardRef<
// 	HTMLSpanElement,
// 	PropsWithChildren<{ active: boolean } & BaseProps>
// >(({ active, ...props }, ref) => (
// 	<span
// 		className="cursor-pointer"
// 		{...props}
// 		ref={ref}
// 		style={{ opacity: active ? 1.0 : 0.3 }}
// 	/>
// ));

// type PtBlockElementType = PtBlockElement["type"];

// export interface BlockButtonProps {
// 	format: PtBlockElementType;
// 	icon: string;
// }

// export const BlockButton = ({ format, icon }: BlockButtonProps) => {
// 	const editor = useSlate();

// 	return (
// 		<Button
// 			active={isBlockActive(editor, format)}
// 			onMouseDown={(event: MouseEvent<HTMLSpanElement>) => {
// 				event.preventDefault();
// 				toggleBlock(editor, format);
// 			}}
// 		>
// 			<img src={icon} />
// 		</Button>
// 	);
// };

// export const isBlockActive = (editor: Editor, type: PtBlockElementType) => {
// 	const { selection } = editor;
// 	if (selection === null) {
// 		return false;
// 	}

// 	const [match = null] = Array.from(
// 		Editor.nodes(editor, {
// 			at: Editor.unhangRange(editor, selection),
// 			match: (n) => Element.isElement(n) && n.type === type,
// 		}),
// 	);

// 	return match !== null;
// };

// // const LIST_TYPES = ["ol", "ul"] as const

// // type ListType = (typeof LIST_TYPES)[number]

// // const isListType = (format: CustomElementFormat): format is ListType => {
// // 	return LIST_TYPES.includes(format as ListType)
// // }

// export const toggleBlock = (editor: Editor, type: PtBlockElementType) => {
// 	const { selection } = editor;
// 	if (selection === null) {
// 		return false;
// 	}

// 	const range = Editor.unhangRange(editor, selection);
// 	const activeNodes = Array.from(
// 		Editor.nodes(editor, {
// 			at: range,
// 			match: (n) => Element.isElement(n) && n.type === type,
// 		}),
// 	);

// 	if (activeNodes.length > 0) {
// 		for (const [node, path] of activeNodes) {
// 			Transforms.setNodes(editor, { type: "paragraph" }, { at: path });
// 		}
// 	} else {
// 		Transforms.setNodes(editor, { type }, { at: range });
// 	}
// };

// export type MarkType = keyof Omit<Text, "text">;

// export const isMarkActive = (editor: Editor, format: MarkType) => {
// 	const marks = Editor.marks(editor);
// 	return marks && (marks[format] ?? false);
// };

// export const toggleMark = (editor: Editor, format: MarkType) => {
// 	const isActive = isMarkActive(editor, format);

// 	if (isActive) {
// 		Editor.removeMark(editor, format);
// 	} else {
// 		Editor.addMark(editor, format, true);
// 	}
// };

// export interface MarkButtonProps {
// 	format: MarkType;
// 	icon: string;
// }

// export const MarkButton = ({ format, icon }: MarkButtonProps) => {
// 	const editor = useSlate();
// 	return (
// 		<Button
// 			active={isMarkActive(editor, format)}
// 			onMouseDown={(event: MouseEvent<HTMLSpanElement>) => {
// 				event.preventDefault();
// 				toggleMark(editor, format);
// 			}}
// 		>
// 			<img src={icon} />
// 		</Button>
// 	);
// };

// export interface LinkButtonProps {
// 	icon: string;
// }

// export const LinkButton = ({ icon }: LinkButtonProps) => {
// 	// const editor = useSlate();
// 	return (
// 		<Button
// 		// active={isMarkActive(editor, format)}
// 		// onMouseDown={(event: MouseEvent<HTMLSpanElement>) => {
// 		// 	event.preventDefault();
// 		// 	toggleMark(editor, format);
// 		// }}
// 		>
// 			<img src={icon} />
// 		</Button>
// 	);
// };
