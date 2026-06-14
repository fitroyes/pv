#!/usr/bin/env -S deno run --allow-read --allow-write=. main.ts

import * as HTML from "https://jsr.io/@huguesguilleus/blogger/0.1.0/html.ts";

const STYLE = (await Deno.readTextFile("style.css"))
	.replaceAll(/[\r\n\t]+/g, "")
	.replaceAll(": ", ":")
	.replaceAll(" {", "{")
	.replaceAll(";}", "}");

await Deno.mkdir("public", { recursive: true });

const dirs = [];
for await (const { name: dir, isDirectory } of Deno.readDir(".")) {
	if (dir.startsWith(".") || !isDirectory) continue;
	if (dir === "public") continue;
	dirs.push(dir);

	const files = (await Array.fromAsync(
		Deno.readDir(dir),
		(entry) => entry.name,
	)).sort();

	Deno.writeTextFile(
		`public/${dir}.html`,
		HTML.htmlRoot(
			"html lang=fr",
			HTML.html(
				"head",
				HTML.htmlAttr`meta charset=utf-8`(),
				HTML.htmlAttr`meta name=viewport content='width=device-width,initial-scale=1'`(),
				HTML.html("title", dir),
				HTML.html("style", { h: STYLE }),
			),
			HTML.html(
				"body.withAside",
				HTML.html("header", HTML.htmlAttr`a href=.`("<-"), " ", dir),
				HTML.html(
					"aside",
					files.map((file, i) =>
						HTML.htmlAttr`a.toc href=#${i + ""}`(
							file.replace(".txt", ""),
						)
					),
				),
				HTML.html(
					"main",
					await Promise.all(
						files.map((name, i) => parse(i, dir, name)),
					),
				),
			),
		),
	);
}

async function parse(
	i: number,
	dir: string,
	name: string,
): Promise<HTML.CHILDREN> {
	return HTML.html(
		"div",
		HTML.html(
			"h1",
			HTML.htmlAttr`a id=${i + ""} href=#${i + ""}`("#"),
			" ",
			name.replace(".txt", ""),
		),
		(await Deno.readTextFile(dir + "/" + name)).split(/\r?\n/).map(
			(line) => {
				if (line == "") return "";
				else if (line.startsWith("===")) {
					return HTML.html("h2", line.slice(3).trim());
				} else {
					const [_, tag = "", rest = ""] =
						line.match(/(\S+)\s+(.*)/) ?? [];
					return HTML.html(
						"div",
						HTML.htmlAttr`a id=${i + ""}.${tag} href=#${
							i + ""
						}.${tag}`(tag),
						" ",
						rest,
					);
				}
			},
		),
	);
}

Deno.writeTextFile(
	"public/index.html",
	HTML.htmlRoot(
		"html lang=fr",
		HTML.html(
			"head",
			HTML.htmlAttr`meta charset=utf-8`(),
			HTML.htmlAttr`meta name=viewport content='width=device-width,initial-scale=1'`(),
			HTML.html("title", "Index des PV"),
			HTML.html("style", { h: STYLE }),
		),
		HTML.html(
			"body",
			HTML.html("header", " Index des PV"),
			HTML.html(
				"aside",
				dirs.map((dir) => HTML.htmlAttr`a.toc href="${dir}.html"`(dir)),
			),
			HTML.html(
				"main",
				(await Deno.readTextFile("README.md")).split("\n").map((line) =>
					HTML.html("div", line)
				),
			),
		),
	),
);
