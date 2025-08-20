"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { EditorState } from "@codemirror/state";

import { Editor } from "./Editor.js";

function getInitialValue(): string {
	const data = localStorage.getItem("snowpost:content");
	return data ?? `A line of text in a paragraph.\n`;
}

export interface AppProps {
	session: { did: string } | null;
}

export const App: React.FC<AppProps> = ({ session }) => {
	const contentRef = useRef<EditorState | null>(null);
	const [initialValue, setInitialValue] = useState<string | null>(null);
	useEffect(() => setInitialValue(getInitialValue()), []);

	const save = useDebouncedCallback(() => {
		if (typeof window !== "undefined" && contentRef.current !== null) {
			// console.log("saving editor state", contentRef.current?.doc.toString());
			// console.log(exportAST(contentRef.current ?? []));
			// const data = saveDocument({ content: contentRef.current ?? [] });
			localStorage.setItem(
				"snowpost:content",
				contentRef.current.doc.toString(),
			);
		}
	}, 1000);

	const handleContentChange = useCallback((state: EditorState) => {
		contentRef.current = state;
		save();
	}, []);

	useEffect(() => {
		const onBeforeUnload = () => save.flush();
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, []);

	const handlePost = useCallback(async () => {
		if (session === null || contentRef.current === null) {
			return;
		}

		try {
			const res = await fetch(`/api/post`, {
				method: "POST",
				body: contentRef.current.doc.toString(),
				headers: { "content-type": "text/markdown" },
			});

			if (res.ok) {
				localStorage.removeItem("snowpost:content");
				const location = res.headers.get("Location");
				if (location !== null) {
					window.location.href = location;
				}
			} else {
				const msg = await res.text();
				throw new Error(`${res.status} ${res.statusText}: ${msg}`);
			}
		} catch (err) {
			alert(err);
		}
	}, []);

	return (
		<div className="my-8">
			<section className="my-4 mx-auto max-w-3xl flex flex-col gap-2">
				{initialValue && (
					<Editor initialValue={initialValue} onChange={handleContentChange} />
				)}
			</section>

			<hr className="my-2" />

			<section className="flex justify-end">
				{session === null ? (
					<span>
						<a href="/login">sign in</a> to post
					</span>
				) : (
					<button onClick={handlePost} className="underline cursor-pointer">
						post
					</button>
				)}
			</section>
		</div>
	);
};
