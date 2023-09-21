const LANGUAGE_MAP = new Map<string, { [key: string]: string }>();

(async () => {
	const res = await fetch("data/languages/.list.json");
	if (!res.ok) return;
	const list = <string[]>await res.json();
	for (const lang of list) {
		const res = await fetch(`data/languages/${lang}.json`);
		if (!res.ok) continue;
		LANGUAGE_MAP.set(lang, await res.json());
	}
})();

export function translate(lang: string, key: string | null, ...args: any[]) {
	if (!key) return "";
	const mapping = LANGUAGE_MAP.get(lang);
	if (!mapping) return key;
	if (mapping[key]) {
		let translated = mapping[key];
		for (const arg of args) translated = translated.replace("%?", arg);
		return translated.replace(/\%\?/g, "");
	}
	return key;
}