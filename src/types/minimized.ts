import { Animation } from "./entities";
import { Weapon } from "./weapons";

export interface MinVec2 {
	x: number;
	y: number;
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
}

export interface MinInventory {
	holding: Weapon;
}

export interface MinGameObject {
	type: string;
	position: MinVec2;
	hitbox: MinHitbox;
}

export interface MinWeapon {
	id: string;
	name: string;
}