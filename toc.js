"use strict";

const observer = new IntersectionObserver((entries) => {
	entries.map((entry) => entry.target.a.dataset.v = entry.isIntersecting);
});

toc.children[0].innerText = "";
document.querySelectorAll("h1").forEach((h1) => {
	const h = h1.innerText.slice(2),
		a = document.createElement("a");
	a.className = "toc";
	a.href = "#" + h1.id;
	a.innerText = h;
	toc.children[0].append(a);
	h1.parentNode.a = a;
	observer.observe(h1.parentNode);
});
