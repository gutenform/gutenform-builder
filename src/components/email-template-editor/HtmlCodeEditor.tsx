/**
 * HTML code editor.
 *
 * Deliberately its own module so that CodeMirror -- the editor, its HTML
 * language support and its theme -- lands in a single lazily-loaded chunk.
 * Importing the theme/language directly from the parent would pull CodeMirror's
 * core into the main admin bundle even though the editor itself is lazy.
 */
import CodeMirror from "@uiw/react-codemirror"
import { html as htmlLang } from "@codemirror/lang-html"
import { oneDark } from "@codemirror/theme-one-dark"

export type HtmlCodeEditorProps = {
	value: string
	onChange: (value: string) => void
	/** Receives the EditorView so the parent can drive insertions. */
	onCreateEditor: (view: any) => void
}

export default function HtmlCodeEditor({ value, onChange, onCreateEditor }: HtmlCodeEditorProps) {
	return (
		<CodeMirror
			value={value}
			height="100%"
			theme={oneDark}
			extensions={[htmlLang()]}
			onChange={onChange}
			onCreateEditor={onCreateEditor}
			basicSetup={{
				lineNumbers: true,
				foldGutter: true,
				highlightActiveLine: true,
				autocompletion: true,
			}}
		/>
	)
}
