import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { RectHitbox } from "../../types/math";
import { GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import Player from "./player";

export default class Ammo extends Entity implements PickupableEntity {
	type = "ammo";
	hitbox = new RectHitbox(1.5, 1.5);
	name: string;
	discardable = true;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force
	// Amount of ammo this entity represents
	amount: number;

	constructor(name: string, color: GunColor, amount: number) {
		super();
		this.name = name;
		this.color = color;
		this.amount = amount;
	}

	picked(player: Player) {
		player.inventory.ammos[this.color] += this.amount;
		return true;
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