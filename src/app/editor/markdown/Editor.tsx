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
	lineNumbers,
	rectangularSelection,
} from "@codemirror/view"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import {
	bracketMatching,
	defaultHighlightStyle,
	foldGutter,
	foldKeymap,
	indentOnInput,
	indentUnit,
	syntaxHighlighting,
} from "@codemirror/language"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"

import { markdownLanguage } from "@codemirror/lang-markdown"

import { useCodeMirror } from "@/app/editor/markdown/useCodeMirror"

const getExtensions = () => [
	indentUnit.of("  "),
	// lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	// foldGutter(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),

	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap,
	]),

	markdownLanguage,
	EditorView.lineWrapping,
	keymap.of(defaultKeymap),
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
		<div
			// className="editor text-sm border border-stone-200 focus-within:border-stone-300"
			className="editor text-sm"
			ref={element}
		></div>
	)
}
