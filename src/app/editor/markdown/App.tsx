"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { EditorState } from "@codemirror/state"

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

export const App: React.FC<AppProps> = (props) => {
	const contentRef = useRef<EditorState | null>(null)
	const [initialValue, setInitialValue] = useState<string | null>(props.initialValue ?? null)

	useEffect(() => {
		if (props.initialValue === undefined) {
			const data = localStorage.getItem(localStorageKey(props.session, props.tid))
			setInitialValue(data ?? defaultInitialValue + "\n\n")
		}
	}, [])

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

	const handleCreate = useCallback(async () => {
		if (props.session === null || contentRef.current === null) {
			return
		}

		try {
			const res = await fetch(`/${props.session.did}`, {
				method: "POST",
				body: contentRef.current.doc.toString(),
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
		} else if (contentRef.current === null) {
			return
		}

		try {
			const res = await fetch(`/${props.session.did}/${props.tid}`, {
				method: "PUT",
				body: contentRef.current.doc.toString(),
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
		} else if (contentRef.current === null) {
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
		<div className="my-8">
			<section className="my-4 mx-auto max-w-3xl flex flex-col gap-2">
				{initialValue && <Editor initialValue={initialValue} onChange={handleContentChange} />}
			</section>

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
		</div>
	)
}
