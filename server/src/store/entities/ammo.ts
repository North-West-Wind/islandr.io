import { CircleHitbox } from "../../types/math";
import { GunColor } from "../../types/misc";
import Item from "./item";
import Player from "./player";

export default class Ammo extends Item {
	type = "ammo";
	hitbox = new CircleHitbox(1);
	amount: number;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force

	constructor(amount: number, color: GunColor) {
		super();
		this.amount = amount;
		this.color = color;
		this.discardable = true;
		this.noCollision = true;
		this.vulnerable = false;
	}

	picked(player: Player) {
		player.inventory.ammos[this.color] += this.amount;
		return true;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { amount: this.amount, color: this.color });
	}
}