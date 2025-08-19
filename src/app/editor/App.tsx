"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

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

export interface AppProps {
	session: { did: string } | null;
}

export const App: React.FC<AppProps> = ({ session }) => {
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
			console.log(exportAST(contentRef.current ?? []));
			const data = saveDocument({ content: contentRef.current ?? [] });
			localStorage.setItem("prototypical:content", data);
		}
	}, 1000);

	useEffect(() => {
		const onBeforeUnload = () => save.flush();
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, []);

	const handlePost = useCallback(async () => {
		if (session === null || contentRef.current === null) {
			return;
		}

		console.log("I should post", session, contentRef.current);
		const content = exportAST(contentRef.current);
		try {
			const res = await fetch(`/api/post`, {
				method: "POST",
				body: JSON.stringify(content),
			});

			if (!res.ok) {
				const msg = await res.text();
				throw new Error(`${res.status} ${res.statusText}: ${msg}`);
			}

			console.log("yay posted", res.headers);
			const location = res.headers.get("Location");
			if (location !== null) {
				window.location.href = location;
			}
		} catch (err) {
			console.error(err);
		}
	}, []);

	return (
		<div className="p-2">
			<section className="my-4 mx-auto max-w-3xl flex flex-col gap-2">
				{initialValue && (
					<Editor initialValue={initialValue} onChange={handleContentChange} />
				)}
			</section>

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
