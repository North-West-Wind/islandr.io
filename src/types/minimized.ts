import { Animation } from "./misc";

export interface MinVec2 {
	x: number;
	y: number;
}

export interface MinLine {
	a: MinVec2;
	b: MinVec2;
	segment: boolean;
}

export interface MinRectHitbox {
	type: string;
	width: number;
	height: number;
}

export interface MinCircleHitbox {
	type: string;
	radius: number;
}

export type MinHitbox = MinRectHitbox | MinCircleHitbox;

export interface MinEntity {
	type: string;
	position: MinVec2;
	direction: MinVec2;
	hitbox: MinHitbox;
	animation: Animation;
	despawn: boolean;
}

export interface MinInventory {
	holding: MinWeapon;
}

export interface MinObstacle {
	type: string;
	position: MinVec2;
	direction: MinVec2;
	hitbox: MinHitbox;
	despawn: boolean;
}

export interface MinMinObstacle {
	type: string;
	position: MinVec2;
}

export interface MinWeapon {
	id: string;
	name: string;
}

export interface MinParticle {
	id: string;
	position: MinVec2;
}

export interface MinTerrain {
	id: string;
	border: number;
}