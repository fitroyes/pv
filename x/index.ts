#!/usr/bin/env -S deno run --allow-write=public --allow-read=.

import * as CSV from "https://jsr.io/@std/csv/1.0.6/mod.ts";
import { CHILDREN, html, minify } from "./html.ts";

const STYLE = html("style", await minify("style.css"));
const SEARCH = html("script type=module", await minify("search.js"));
const FOOTER = html(
	"footer",
	"Par les jeunes insoumis·es de Troyes",
	html("br"),
	html(
		"a href=https://actionpopulaire.fr/groupes/e5b88d81-1ec3-4c50-a2ff-7f180373177f/ ",
		"[action populaire]",
	),
	" ",
	html("a href=mailto:jeunesinsoumistroyes@gmail.com", "[mail]"),
	" ",
	html("a href=https://github.com/jitroyes/pv", "[github]"),
);

const dirs = await walkName(".", /^data-/);

await Deno.mkdir("public", { recursive: true });
await writeIndex();
await Promise.all(dirs.map((dir) => dataDir(dir)));

async function writeIndex() {
	await Deno.writeTextFile(
		"public/index.html",
		"<!DOCTYPE html>" + html(
			"html lang=fr",
			html(
				"head",
				html(`meta charset=utf-8`),
				html(
					`meta name=viewport content="width=device-width,initial-scale=1"`,
				),
				html("title", "Tous les dossiers"),
				STYLE,
			),
			html(
				"body",
				html("header", "Tous les dossiers"),
				html(
					"main",
					html(
						"ul.toc",
						dirs.map((d) =>
							html(
								"li",
								html(
									`a href=${d}.html`,
									d.replace("data-", ""),
								),
							)
						),
					),
				),
				FOOTER,
			),
		).h,
	);
}

async function dataDir(dir: string, files?: string[]) {
	files ||= await walkName(dir, /\.txt$/);

	const csvData: CSV.DataItem[] = [];
	const tagsMap = new Map<string, number>();
	const items = await Promise.all(
		files.map((f) => file(dir, f, csvData, tagsMap)),
	);
	const tagsList = Array.from(tagsMap.keys()).sort();

	const title = dir.replace("data-", "PV de: ");
	await Deno.writeTextFile(
		`public/${dir}.html`,
		"<!DOCTYPE html>" + html(
			"html lang=fr",
			html(
				"head",
				html(`meta charset=utf-8`),
				html(
					`meta name=viewport content="width=device-width,initial-scale=1"`,
				),
				html("title", title),
				STYLE,
			),
			html(
				"body",
				html("header", title),
				html(
					"main",
					html("a href=.", "Tous les dossiers"),
					" ",
					html(`a href=${dir}.csv`, "CSV"),
					html(
						"ul.toc",
						"Sommaire",
						files.map((f) => html("li", html("a href=#" + f, f))),
					),
					html(
						"input id=s type=search hidden placeholder='Recherche simple'",
					),
					html(
						"div.tags",
						tagsList.map((t) => [
							html("span.tag.item", `${t}(${tagsMap.get(t)})`),
							" ",
						]),
					),
					items,
				),
				FOOTER,
				SEARCH,
			),
		).h,
	);

	await Deno.writeTextFile(
		`public/${dir}.csv`,
		CSV.stringify(csvData, {
			columns: [
				"path",
				"page",
				"folder",
				"tags",
				"title",
				"text",
			],
		}),
	);
}

async function file(
	dir: string,
	name: string,
	csvData: CSV.DataItem[],
	tagsMap: Map<string, number>,
): Promise<CHILDREN[]> {
	const path = dir + "/" + name;
	const lines = (await Deno.readTextFile(path)).split(/\r?\n/);

	const groups: string[][] = [[]];
	for (const line of lines) {
		if (line) {
			groups[groups.length - 1].push(line);
		} else {
			groups.push([]);
		}
	}

	return [
		html("h1 id=" + name, name.replace(/\.txt$/, "")),
		...groups.filter((x) => x.length).map(([head, title, ...text]) => {
			const [page, folder, ...tags] = head.split(" ");
			csvData.push({
				path,
				page,
				folder,
				tags: tags.join(";"),
				title,
				text: text.join("\n"),
			});
			for (const tag of tags) {
				tagsMap.set(tag, (tagsMap.get(tag) ?? 0) + 1);
			}
			return html(
				`div.item id=${path}/${folder}`,
				html(
					"div.meta",
					html(
						`a.id href=#${path}/${folder}`,
						"#",
					),
					` [dossier=${folder} | page=${page}] `,
					...tags.map((tag) => [html("span.tag", "#", tag), " "]),
				),
				html("div.title", title),
				text.map((text) => html("p", text)),
			);
		}),
	];
}

/** call walk() and return the results entry names. */
async function walkName(root: string, match: RegExp): Promise<string[]> {
	return (await Array.fromAsync(Deno.readDir(root)))
		.map((entry) => entry.name)
		.filter((name) => match.test(name))
		.sort();
}
