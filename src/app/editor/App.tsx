"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

// import { Button, defaultTheme, Provider } from "@adobe/react-spectrum";

import { Descendant } from "slate";
import { useDebouncedCallback } from "use-debounce";

import { Editor } from "./Editor.js";
import { exportAST, loadDocument, saveDocument } from "./index.js";
import { PtDocument } from "./types.js";

function getInitialValue(): PtDocument {
	const data = localStorage.getItem("prototypical:content");
	if (data !== null) {
		return loadDocument(data);
	}

	return {
		content: [
			{
				type: "paragraph",
				children: [{ text: "A line of text in a paragraph." }],
			},
		],
	};
}

export interface AppProps {}

export const App: React.FC<AppProps> = ({}) => {
	const contentRef = useRef<Descendant[] | null>(null);
	const [initialValue, setInitialValue] = useState<Descendant[] | null>(null);
	useEffect(() => {
		const doc = getInitialValue();
		setInitialValue(doc.content);
		contentRef.current = doc.content;
	}, []);

	const handleContentChange = useCallback((content: Descendant[]) => {
		contentRef.current = content;
		save();
	}, []);

	const save = useDebouncedCallback(() => {
		if (typeof window !== "undefined") {
			console.log(exportAST({ content: contentRef.current ?? [] }));
			const data = saveDocument({ content: contentRef.current ?? [] });
			localStorage.setItem("prototypical:content", data);
		}
	}, 1000);

	useEffect(() => {
		const onBeforeUnload = () => save.flush();
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, []);

	return (
		// <Provider theme={defaultTheme}>
		<main className="p-2">
			<section className="my-16 mx-auto max-w-2xl flex flex-col gap-2">
				{initialValue && (
					<Editor initialValue={initialValue} onChange={handleContentChange} />
				)}
			</section>
		</main>
		// </Provider>
	);
};
