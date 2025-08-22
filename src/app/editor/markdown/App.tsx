"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { EditorState } from "@codemirror/state";

import { Editor } from "./Editor.js";

const defaultInitialValue = `
# The start of something beautiful

It was a dark and stormy night...
`.trim();

const localStorageKey = (session: { did: string } | null, tid?: string) =>
	session !== null && tid !== undefined
		? `snowpost:content:update:${session.did}/${tid}`
		: "snowpost:content:create";

export interface AppProps {
	session: { did: string } | null;
	tid?: string;
	initialValue?: string;
}

export const App: React.FC<AppProps> = (props) => {
	const contentRef = useRef<EditorState | null>(null);
	const [initialValue, setInitialValue] = useState<string | null>(
		props.initialValue ?? null,
	);

	useEffect(() => {
		if (props.initialValue === undefined) {
			const data = localStorage.getItem(
				localStorageKey(props.session, props.tid),
			);
			setInitialValue(data ?? defaultInitialValue + "\n\n");
		}
	}, []);

	const save = useDebouncedCallback(() => {
		if (typeof window !== "undefined" && contentRef.current !== null) {
			localStorage.setItem(
				localStorageKey(props.session, props.tid),
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
		if (props.session === null || contentRef.current === null) {
			return;
		}

		try {
			const [method, url] =
				props.tid === undefined
					? ["POST", `/${props.session.did}`]
					: ["PUT", `/${props.session.did}/${props.tid}`];

			const res = await fetch(url, {
				method: method,
				body: contentRef.current.doc.toString(),
				headers: { "content-type": "text/markdown" },
			});

			if (res.ok) {
				localStorage.removeItem(localStorageKey(props.session, props.tid));
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

	const handleDelete = useCallback(() => {
		//
	}, []);

	return (
		<div className="my-8">
			<section className="my-4 mx-auto max-w-3xl flex flex-col gap-2">
				{initialValue && (
					<Editor initialValue={initialValue} onChange={handleContentChange} />
				)}
			</section>

			<hr className="my-2" />

			<section className="flex flex-row justify-between">
				<span>
					{props.session !== null && props.tid !== undefined && (
						<button onClick={handleDelete} className="underline cursor-pointer">
							delete
						</button>
					)}
				</span>
				<span>
					{props.session === null ? (
						<span>
							<a href="/login">sign in</a> to post
						</span>
					) : (
						<button onClick={handlePost} className="underline cursor-pointer">
							{props.tid === undefined ? "post" : "save"}
						</button>
					)}
				</span>
			</section>
		</div>
	);
};
