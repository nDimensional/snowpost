import { useEffect } from "react"

import { EditorState } from "@codemirror/state"
import {
	crosshairCursor,
	drawSelection,
	dropCursor,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	rectangularSelection,
} from "@codemirror/view"
import { highlightSelectionMatches } from "@codemirror/search"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import {
	bracketMatching,
	defaultHighlightStyle,
	indentOnInput,
	indentUnit,
	syntaxHighlighting,
} from "@codemirror/language"
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"

import { markdown, commonmarkLanguage } from "@codemirror/lang-markdown"

import { useCodeMirror } from "@/app/editor/markdown/useCodeMirror"
import { languages } from "@/app/shared/languages"

const getExtensions = () => [
	indentUnit.of("  "),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),

	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	keymap.of([
		...defaultKeymap,
		...historyKeymap,
		...closeBracketsKeymap,
		indentWithTab,
		{ key: "Mod-s", preventDefault: true, stopPropagation: true },
	]),

	markdown({
		base: commonmarkLanguage,
		addKeymap: true,
		codeLanguages: (desc: string) => languages[desc] ?? null,
	}),

	EditorView.lineWrapping,
]

interface EditorProps {
	initialValue: string
	onChange?: (state: EditorState) => void
}

export function Editor({ initialValue, onChange }: EditorProps) {
	const [state, transaction, _, element] = useCodeMirror<HTMLDivElement>({
		doc: initialValue,
		extensions: getExtensions(),
	})

	useEffect(() => {
		if (onChange !== undefined && state !== null) {
			if (transaction === null || transaction.docChanged) {
				onChange(state)
			}
		}
	}, [state, transaction])

	return (
		<div className="editor text-sm bg-white border border-stone-200 focus-within:border-stone-300" ref={element}></div>
	)
}
