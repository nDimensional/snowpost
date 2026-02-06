"use client"

import React, { RefObject, useCallback, useEffect, useId, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { EditorState } from "@codemirror/state"
import { fromMarkdown } from "mdast-util-from-markdown"
import { mdastToHTML } from "@/app/shared/render"

import { Editor } from "@/app/editor/markdown/Editor"

const defaultInitialValue = `
# The start of something beautiful

It was a dark and stormy night...
`.trim()

const localStorageKey = (session: { did: string } | null, tid?: string) =>
	session !== null && tid !== undefined ? `snowpost:content:update:${session.did}/${tid}` : "snowpost:content:create"

export interface AppProps {
	session: { did: string } | null
	tid?: string
	initialValue?: string
}

interface FooterProps extends AppProps {
	contentRef: RefObject<EditorState | null>
}

const Footer: React.FC<FooterProps> = (props) => {
	const handleCreate = useCallback(async () => {
		if (props.session === null || props.contentRef.current === null) {
			return
		}

		try {
			const res = await fetch(`/${props.session.did}`, {
				method: "POST",
				body: props.contentRef.current.doc.toString(),
				headers: { "content-type": "text/markdown" },
			})

			if (res.ok) {
				localStorage.removeItem(localStorageKey(props.session, props.tid))
				const location = res.headers.get("Location")
				if (location !== null) {
					window.location.href = location
				}
			} else {
				const msg = await res.text()
				throw new Error(`${res.status} ${res.statusText}: ${msg}`)
			}
		} catch (err) {
			alert(err)
		}
	}, [])

	const handleUpdate = useCallback(async () => {
		if (props.session === null || props.tid === undefined) {
			return
		} else if (props.contentRef.current === null) {
			return
		}

		try {
			const res = await fetch(`/${props.session.did}/${props.tid}`, {
				method: "PUT",
				body: props.contentRef.current.doc.toString(),
				headers: { "content-type": "text/markdown" },
			})

			if (res.ok) {
				localStorage.removeItem(localStorageKey(props.session, props.tid))
				const location = res.headers.get("Location")
				if (location !== null) {
					window.location.href = location
				}
			} else {
				const msg = await res.text()
				throw new Error(`${res.status} ${res.statusText}: ${msg}`)
			}
		} catch (err) {
			alert(err)
		}
	}, [])

	const handleDelete = useCallback(async () => {
		if (props.session === null || props.tid === undefined) {
			return
		} else if (props.contentRef.current === null) {
			return
		}

		try {
			const res = await fetch(`/${props.session.did}/${props.tid}`, {
				method: "DELETE",
			})

			if (res.ok) {
				localStorage.removeItem(localStorageKey(props.session, props.tid))
				const location = res.headers.get("Location")
				if (location !== null) {
					window.location.href = location
				}
			} else {
				const msg = await res.text()
				throw new Error(`${res.status} ${res.statusText}: ${msg}`)
			}
		} catch (err) {
			alert(err)
		}
	}, [])

	return (
		<section className="flex flex-row justify-between">
			<span>
				{props.session !== null && props.tid !== undefined ? (
					<button onClick={handleDelete} className="underline cursor-pointer">
						delete
					</button>
				) : null}
			</span>
			<span>
				{props.session === null ? (
					<span>
						<a href="/login">sign in</a> to post
					</span>
				) : props.tid === undefined ? (
					<button onClick={handleCreate} className="underline cursor-pointer">
						post
					</button>
				) : (
					<button onClick={handleUpdate} className="underline cursor-pointer">
						save
					</button>
				)}
			</span>
		</section>
	)
}

function getInitialValue(props: AppProps) {
	const data = localStorage.getItem(localStorageKey(props.session, props.tid))
	return data ?? defaultInitialValue + "\n\n"
}

export const App: React.FC<AppProps> = (props) => {
	const contentRef = useRef<EditorState | null>(null)
	const [initialValue, setInitialValue] = useState<string>(props.initialValue ?? getInitialValue(props))

	const save = useDebouncedCallback(() => {
		if (typeof window !== "undefined" && contentRef.current !== null) {
			localStorage.setItem(localStorageKey(props.session, props.tid), contentRef.current.doc.toString())
		}
	}, 1000)

	const handleContentChange = useCallback((state: EditorState) => {
		contentRef.current = state
		save()
	}, [])

	useEffect(() => {
		const onBeforeUnload = () => save.flush()
		window.addEventListener("beforeunload", onBeforeUnload)
		return () => window.removeEventListener("beforeunload", onBeforeUnload)
	}, [])

	const editId = useId()
	const previewId = useId()

	const [previewHtml, setPreviewHtml] = useState<string | null>(null)

	if (initialValue === null) {
		return null
	}

	return (
		<div className="my-8">
			<section className="my-4 mx-auto max-w-3xl flex flex-col">
				<div className="border-b border-stone-300">
					<div className="inline-flex border border-b-0 border-stone-300 text-base">
						<input
							className="hidden peer/edit"
							id={editId}
							type="radio"
							value="edit"
							name="mode"
							checked={previewHtml === null}
							onChange={() => setPreviewHtml(null)}
						/>
						<label
							className="py-0.5 px-2 cursor-pointer peer-checked/edit:bg-stone-200 text-stone-600 peer-checked/edit:text-black"
							htmlFor={editId}
						>
							edit
						</label>
						<div className="border-l border-stone-300"></div>
						<input
							className="hidden peer/preview"
							id={previewId}
							type="radio"
							value="preview"
							name="mode"
							checked={previewHtml !== null}
							onChange={() => {
								const content = contentRef.current?.doc?.toString() ?? ""
								setInitialValue(content)
								setPreviewHtml(mdastToHTML(fromMarkdown(content)))
							}}
						/>
						<label
							className="py-0.5 px-2 cursor-pointer peer-checked/preview:bg-stone-200 text-stone-600 peer-checked/preview:text-black"
							htmlFor={previewId}
						>
							preview
						</label>
					</div>
				</div>

				{previewHtml === null ? (
					<div className="border border-stone-300 border-t-0">
						<Editor initialValue={initialValue} onChange={handleContentChange} />
					</div>
				) : (
					<div className="border-b border-stone-300">
						<div className="content" dangerouslySetInnerHTML={{ __html: previewHtml }}></div>
					</div>
				)}
			</section>

			<Footer {...props} contentRef={contentRef} />
		</div>
	)
}
