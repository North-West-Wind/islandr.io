// Note: This is the gun item

import { Entity } from "../../types/entities";
import { CircleHitbox } from "../../types/maths";

export enum GunColor {
	YELLOW = 0,
	RED = 1,
	BLUE = 2,
	GREEN = 3
}

export default class Gun extends Entity {
	type = "gun";
	hitbox = new CircleHitbox(2);
	name: string;
	color: GunColor;

	constructor(name: string, color: GunColor) {
		super();
		this.name = name;
		this.color = color;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { name: this.name, color: this.color });
	}
}