import type React from "react"
import type hast from "hast"
import type mdast from "mdast"
import { toHast } from "mdast-util-to-hast"

const isRoot = (node: hast.Node): node is hast.Root => node.type === "root"
const isText = (node: hast.Node): node is hast.Text => node.type === "text"
const isElement = (node: hast.Node): node is hast.Element => node.type === "element"

export function renderPost(root: mdast.Root): React.ReactNode {
	return renderNode(toHast(root))
}

function renderNode(node: hast.Node): React.ReactNode {
	if (isRoot(node)) {
		return <>{...node.children.map(renderNode)}</>
	} else if (isText(node)) {
		return node.value
	} else if (isElement(node)) {
		const children = node.children.map(renderNode)
		switch (node.tagName) {
			// Block elements
			case "div":
				return <div>{...children}</div>
			case "p":
				return <p>{...children}</p>
			case "h1":
				return <h1>{...children}</h1>
			case "h2":
				return <h2>{...children}</h2>
			case "h3":
				return <h3>{...children}</h3>
			case "h4":
				return <h4>{...children}</h4>
			case "h5":
				return <h5>{...children}</h5>
			case "h6":
				return <h6>{...children}</h6>
			case "blockquote":
				return <blockquote>{...children}</blockquote>
			case "pre":
				return <pre>{...children}</pre>
			case "ul":
				return <ul>{...children}</ul>
			case "ol":
				return <ol>{...children}</ol>
			case "li":
				return <li>{...children}</li>
			case "hr":
				return <hr />
			case "table":
				return <table>{...children}</table>
			case "thead":
				return <thead>{...children}</thead>
			case "tbody":
				return <tbody>{...children}</tbody>
			case "tr":
				return <tr>{...children}</tr>
			case "th":
				return <th>{...children}</th>
			case "td":
				return <td>{...children}</td>

			// Inline elements
			case "span":
				return <span>{...children}</span>
			case "a":
				return <a {...node.properties}>{...children}</a>
			case "strong":
				return <strong>{...children}</strong>
			case "em":
				return <em>{...children}</em>
			case "code":
				return <code>{...children}</code>
			case "del":
				return <del>{...children}</del>
			case "br":
				return <br />
			case "img":
				return <img {...node.properties} />
			default:
				throw new Error("unsupported JSX Element")
		}
	}
}
