#!/usr/bin/env -S deno run --allow-write --allow-net=opendata.spl-xdemat.fr

// Just change the UID from xdemat.
const UID = "MA10081";

const response = await fetch(
	"https://opendata.spl-xdemat.fr/ajax/affichage-administratif/ajx_seances.php",
	{
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			isIframe: "1",
			uid: UID,
			affichage: "seances",
			anneeCourante: "2025",
			page: "1",
			nbItems: "100",
		}),
	},
);
const { html } = await response.json();

console.log(response.status, response.statusText);

Deno.writeTextFile(
	UID + ".html",
	"" +
		`<!doctype html>` +
		`<meta charset=utf-8>` +
		`<style>` +
		`.padding, .deliberation {` +
		`margin: 1ex;` +
		`border: solid 2px;` +
		`padding: .3ex 1ex;` +
		`}` +
		`hr {display: none}` +
		`</style>` +
		`<title>Séances</title>` +
		`<h1>Séances</h1>` +
		html,
);
