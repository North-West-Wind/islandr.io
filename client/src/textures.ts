import { TracerColor, TracerColorData } from "./types/data";
import { getMode } from "./homepage";

export function getWeaponImagePath(id: string) {
	return id ? `assets/${getMode()}/images/game/loots/weapons/${id}.svg` : "";
}

export function getBarrelImagePath(id: string) {
	return `assets/${getMode()}/images/game/guns/${id}.svg`;
}

export function getBackpackImagePath(level: number) {
	return `assets/${getMode()}/images/game/loots/backpacks/${level}.svg`;
}
export function getHelmetImagePath(level: number) {
	return `assets/${getMode()}/images/game/loots/proc-items/helmet-level-${level}.svg`;
}
export function getVestImagePath(level: number) {
	return `assets/${getMode()}/images/game/loots/proc-items/vest-level-${level}.svg`;
}

export function getHealingImagePath(id: string) {
	return `assets/${getMode()}/images/game/loots/healings/${id}.svg`;
}

export function getParticleImagePath(id: string) {
	return `assets/${getMode()}/images/game/particles/${id}.svg`;
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

const textureStore = new Map<string, HTMLImageElement>();
export function getTexture(path: string) {
	if (!textureStore.has(path)) {
		const img = new Image();
		img.src = path;
		textureStore.set(path, img);
		return img;
	} else return textureStore.get(path);
}