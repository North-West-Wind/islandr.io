// Note: This is the gun item

import { Entity } from "../../types/entity";
import { CircleHitbox } from "../../types/math";
import { GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";

export default class Gun extends Entity {
	type = "gun";
	hitbox = new CircleHitbox(2);
	name: string;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force

	constructor(name: string, color: GunColor) {
		super();
		this.name = name;
		this.color = color;
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		this.velocity = this.velocity.scaleAll(1 - this.friction);
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { name: this.name, color: this.color });
	}
}