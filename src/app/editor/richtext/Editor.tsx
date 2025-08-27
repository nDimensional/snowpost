// import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
// import { Descendant, createEditor } from "slate";
// import {
// 	Slate,
// 	Editable,
// 	RenderElementProps,
// 	RenderLeafProps,
// 	withReact,
// } from "slate-react";
// import { withHistory } from "slate-history";
// import isHotkey from "is-hotkey";

// import {
// 	BlockButton,
// 	LinkButton,
// 	MarkButton,
// 	MarkType,
// 	toggleMark,
// } from "./Toolbar.js";
// import { signalInvalidType } from "./utils.js";

// const HOTKEYS: Record<string, MarkType> = {
// 	"mod+b": "bold",
// 	"mod+i": "italic",
// 	// "mod+`": "code",
// };

// function renderElement(props: RenderElementProps) {
// 	switch (props.element.type) {
// 		case "paragraph":
// 			return <p {...props.attributes}>{props.children}</p>;
// 		case "h1":
// 			return <h1 {...props.attributes}>{props.children}</h1>;
// 		case "h2":
// 			return <h2 {...props.attributes}>{props.children}</h2>;
// 		case "h3":
// 			return <h3 {...props.attributes}>{props.children}</h3>;
// 		case "blockquote":
// 			return <blockquote {...props.attributes}>{props.children}</blockquote>;
// 		case "link":
// 			return <a {...props.attributes}>{props.children}</a>;
// 		default:
// 			signalInvalidType(props.element);
// 	}
// }

// function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
// 	const style: React.CSSProperties = {};
// 	if (leaf.bold) style.fontWeight = "bold";
// 	if (leaf.italic) style.fontStyle = "italic";
// 	return (
// 		<span {...attributes} style={style}>
// 			{children}
// 		</span>
// 	);
// }

// export interface EditorProps {
// 	initialValue?: Descendant[];
// 	onChange?: (value: Descendant[]) => void;
// }

// export const Editor: React.FC<EditorProps> = (props) => {
// 	const [editor] = useState(() => withReact(withHistory(createEditor())));

// 	return (
// 		<div className="flex flex-col h-max">
// 			<Slate
// 				editor={editor}
// 				initialValue={
// 					props.initialValue ?? [
// 						{ type: "paragraph", children: [{ text: "" }] },
// 					]
// 				}
// 				onChange={(value) => {
// 					if (editor.operations.some((op) => op.type !== "set_selection")) {
// 						props.onChange?.(value);
// 					}
// 				}}
// 			>
// 				<div className="flex flex-row gap-2 px-2 py-2 sticky top-0 z-1 bg-stone-100 border border-stone-300 self-stretch">
// 					<BlockButton format="h1" icon="/icons/format_h1.svg" />
// 					<BlockButton format="h2" icon="/icons/format_h2.svg" />
// 					<BlockButton format="h3" icon="/icons/format_h3.svg" />
// 					<BlockButton format="blockquote" icon="/icons/format_quote.svg" />

// 					<LinkButton icon="/icons/link.svg" />

// 					<MarkButton format="bold" icon="/icons/format_bold.svg" />
// 					<MarkButton format="italic" icon="/icons/format_italic.svg" />
// 				</div>
// 				<div className="bg-white border border-t-0 border-stone-200 focus-within:border-stone-300 flex-1">
// 					<Editable
// 						className="editor"
// 						renderElement={renderElement}
// 						renderLeaf={renderLeaf}
// 						spellCheck
// 						autoFocus
// 						onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
// 							for (const hotkey in HOTKEYS) {
// 								if (isHotkey(hotkey, event as any)) {
// 									event.preventDefault();
// 									toggleMark(editor, HOTKEYS[hotkey]);
// 								}
// 							}
// 						}}
// 					/>
// 				</div>
// 			</Slate>
// 		</div>
// 	);
// };
