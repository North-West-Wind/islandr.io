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
	type: "rect";
	width: number;
	height: number;
}

export interface MinCircleHitbox {
	type: "circle";
	radius: number;
}

export type MinHitbox = MinRectHitbox | MinCircleHitbox;

export interface MinEntity {
	id: string;
	type: string;
	position: MinVec2;
	direction: MinVec2;
	hitbox: MinHitbox;
	animations: string[];
	despawn: boolean;
}

export interface MinInventory {
	holding: MinWeapon;
	backpackLevel: number;
	vestLevel: number;
}

export interface MinObstacle {
	id: string;
	type: string;
	position: MinVec2;
	direction: MinVec2;
	hitbox: MinHitbox;
	despawn: boolean;
	animations: string[];
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
}

export interface MinBuilding {
	id: string;
	position: MinVec2;
	direction: MinVec2;
	zones: { position: MinVec2, hitbox: MinHitbox }[];
	color?: number;
}