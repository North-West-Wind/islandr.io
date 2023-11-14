const LANGUAGE_MAP = new Map<string, { [key: string]: string }>();

(async () => {
	// Load the list of languages
	const res = await fetch("data/languages/.list.json");
	if (!res.ok) return;
	const list = <string[]>await res.json();
	for (const lang of list) {
		// Load each language, and put the key-value translations into the map
		const res = await fetch(`data/languages/${lang}.json`);
		if (!res.ok) continue;
		LANGUAGE_MAP.set(lang, await res.json());
	}
})();

/**
 * Translates a key to the language specified using the data/languages JSONs
 * @param lang Chosen language
 * @param key Key for translation
 * @param args Additional arguments to be added to the returned string
 * @returns Translated string
 */
export function translate(lang: string, key: string | null, ...args: any[]) {
	if (!key) return "";
	const mapping = LANGUAGE_MAP.get(lang);
	if (!mapping) return key;
	if (mapping[key]) {
		let translated = mapping[key];
		for (const arg of args) translated = translated.replace("%?", arg);
		return translated.replace(/%\?/g, "");
	}
	return key;
}