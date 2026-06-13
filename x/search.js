const items = [...document.querySelectorAll(".item")].map(
	(tr) => [tr, tr.innerText.toLowerCase()],
);

s.hidden = false;
s.oninput = (_) => {
	const queries = s.value.toLowerCase().split(/\s+/);
	for (const [tr, target] of items) {
		tr.hidden = queries.some((q) => !target.includes(q));
	}
};
