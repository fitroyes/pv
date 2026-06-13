import { escape } from "https://jsr.io/@std/html/1.0.4/mod.ts";

export interface HTML {
	h: string;
}

export type CHILDREN = string | HTML | (CHILDREN[]);

/**
 * Create a html element.
 * @param tag The tag with escaped attributes
 * @param children children. Is simple string, auto escape it.
 * @returns The Html element.
 */
export function html(tag: string, ...children: CHILDREN[]): HTML {
	const [tagNameAndClasses, tagEnd = ""] = tag.split(/(\ .*)/);
	const [tagName, ...classNames] = tagNameAndClasses.split(".");

	let h = "<" + tagName;
	if (classNames.length) h += ` class="${classNames.join(" ")}"`;
	if (tagEnd) h += tagEnd;
	h += ">";

	function append(child: CHILDREN) {
		if (Array.isArray(child)) {
			child.forEach(append);
		} else if (typeof child === "string") {
			h += escape(child);
		} else {
			h += child.h;
		}
	}
	append(children);

	switch (tagName) {
		// Source: https://dev.w3.org/html5/spec-LC/syntax.html#elements-0
		case "area":
		case "base":
		case "br":
		case "col":
		case "command":
		case "embed":
		case "hr":
		case "img":
		case "input":
		case "keygen":
		case "link":
		case "meta":
		case "param":
		case "source":
		case "track":
		case "wbr":
			break;
		default:
			h += `</${tagName}>`;
	}

	return { h };
}

export async function minify(file: string): Promise<CHILDREN> {
	return {
		h: (await Deno.readTextFile(file))
			.replaceAll(/(\/\*[\s\S]*?\*\/|\s+)/g, " ")
			.replaceAll(/(\W) /g, "$1")
			.replaceAll(/ (\W)/g, "$1"),
	};
}
