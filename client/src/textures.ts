import { TracerColor, TracerColorData } from "./types/data";

export function getWeaponImagePath(id: string) {
	return id ? `assets/images/game/loots/weapons/${id}.svg` : "";
}

export function getBarrelImagePath(id: string) {
	return `assets/images/game/guns/${id}.svg`;
}

export function getBackpackImagePath(level: number) {
	return `assets/images/game/loots/backpacks/${level}.svg`;
}
export function getHelmetImagePath(level: number) {
	return `assets/images/game/loots/proc-items/helmet-level-${level}.svg`;
}
export function getVestImagePath(level: number) {
	return `assets/images/game/loots/proc-items/vest-level-${level}.svg`;
}


export function getHealingImagePath(id: string) {
	return `assets/images/game/loots/healings/${id}.svg`;
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