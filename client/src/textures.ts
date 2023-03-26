import { TracerColor, TracerColorData } from "./types/data";

const weapons = new Map<string, HTMLImageElement & { loaded: boolean }>();
(async() => {
	for (const id of await fetch(`data/weapons/guns/.list.json`).then(res => res.json())) {
		const img: HTMLImageElement & { loaded: boolean } = Object.assign(new Image(), { loaded: false });
		img.onload = () => img.loaded = true;
		img.src = `assets/images/game/loots/weapons/${id}.png`;
	
		weapons.set(id, img);
	}
})();

export function getWeaponImage(id: string) {
	return weapons.get(id);
}

const tracerColors = new Map<string, TracerColor>();
(async() => {
	const data = <TracerColorData> await fetch(`data/colors/tracers.json`).then(res => res.json());
	for (const id of Object.keys(data)) {
		tracerColors.set(id, data[id]);
	}
})();

export function getTracerColor(id: string) {
	return tracerColors.get(id);
}