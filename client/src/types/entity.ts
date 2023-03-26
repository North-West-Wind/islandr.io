import { Player } from "../store/entities";
import { castCorrectWeapon, WEAPON_SUPPLIERS } from "../store/weapons";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "./math";
import { MinCircleHitbox, MinEntity, MinInventory, MinRectHitbox } from "./minimized";
import { Renderable } from "./extenstions";
import {  Weapon } from "./weapon";
import { GunColor } from "../constants";
import { DEFINED_ANIMATIONS } from "../store/animations";
import { Animation } from "./animation";

export class Inventory {
	holding: number;
	weapons: Weapon[];
	// Array of 2 numbers. Order: gun slots, melee slots, grenade slot.
	slots: number[];
	// Indices are colors. Refer to GunColor
	ammos: number[];
	// Utilities. Maps ID to amount of util.
	utilities: Map<string, number>;
	backpackLevel!: number;

	constructor(holding: number, slots: number[], weapons?: Weapon[], ammos?: number[], utilities?: Map<string, number>) {
		this.holding = holding;
		this.slots = slots;
		this.weapons = weapons || Array(slots.reduce((a, b) => a + b));
		this.ammos = ammos || Array(Object.keys(GunColor).length / 2).fill(0);
		this.utilities = utilities || new Map();
	}

	getWeapon(index = -1) {
		if (index < 0) index = this.holding;
		if (this.holding < this.weapons.length) return this.weapons[this.holding];
		const util = Object.keys(this.utilities)[this.holding - this.weapons.length];
		if (this.utilities.get(util)) return WEAPON_SUPPLIERS.get(util)!.create();
		return undefined;
	}
}

// Inventory, mainly for players
export class PartialInventory {
	holding: Weapon;
	backpackLevel: number;

	constructor(minInv: MinInventory) {
		this.holding = castCorrectWeapon(minInv.holding);
		this.backpackLevel = minInv.backpackLevel;
	}
}

// An entity with position, velocity and hitbox
export abstract class Entity implements Renderable {
	id!: string;
	type!: string;
	position!: Vec2;
	direction!: Vec2;
	hitbox!: Hitbox;
	animations: Animation[] = [];
	health!: number;
	maxHealth!: number;
	despawn!: boolean;
	zIndex = 0;

	constructor(minEntity: MinEntity) {
		this.copy(minEntity);
	}

	copy(minEntity: MinEntity) {
		this.id = minEntity.id;
		this.type = minEntity.type;
		this.position = new Vec2(minEntity.position.x, minEntity.position.y);
		this.direction = new Vec2(minEntity.direction.x, minEntity.direction.y);
		if (minEntity.hitbox.type === "rect") {
			const rect = <MinRectHitbox> minEntity.hitbox;
			this.hitbox = new RectHitbox(rect.width, rect.height);
		} else {
			const circle = <MinCircleHitbox> minEntity.hitbox;
			this.hitbox = new CircleHitbox(circle.radius);
		}
		this.health = this.maxHealth = 100;
		this.despawn = minEntity.despawn;
		for (const anim of minEntity.animations)
			if (DEFINED_ANIMATIONS.has(anim)) {
				const duration = DEFINED_ANIMATIONS.get(anim)!.duration;
				this.animations.push({ id: anim, duration: duration });
			}
	}

	abstract render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void;

	renderTick(time: number) {
		const removable: number[] = [];
		for (let ii = 0; ii < this.animations.length; ii++) {
			this.animations[ii].duration -= time;
			if (this.animations[ii].duration <= 0)
				removable.push(ii);
		}
		for (let ii = removable.length - 1; ii >= 0; ii--)
			this.animations.splice(removable[ii], 1);
	}
}

export class DummyEntity extends Entity {
	render(_you: Player, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _scale: number) { }
}