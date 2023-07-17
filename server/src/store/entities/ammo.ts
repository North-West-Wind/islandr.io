import { Inventory } from "../../types/entity";
import { CircleHitbox, Vec2 } from "../../types/math";
import { GunColor, ReverseGunColour } from "../../types/misc";
import Item from "./item";
import Player from "./player";

export default class Ammo extends Item {
	type = "ammo";
	name: string;
	hitbox = new CircleHitbox(1);
	amount: number;
	color: GunColor;

	constructor(amount: number, color: GunColor) {
		super();
		this.amount = amount;
		this.color = color;
		
		this.name = `${ReverseGunColour[`a${this.color}`]} (${this.amount})`;
	}

	picked(player: Player) {
		const newAmount = Math.min(Inventory.maxAmmos[player.inventory.backpackLevel][this.color], player.inventory.ammos[this.color] + this.amount);
		const delta = newAmount - player.inventory.ammos[this.color];
		player.inventory.ammos[this.color] = newAmount;
		if (delta != this.amount) {
			this.amount -= delta;
			this.setVelocity(Vec2.UNIT_X.addAngle(this.position.addVec(player.position.inverse()).angle()).scaleAll(0.001));
			return false;
		}
		return true;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { amount: this.amount, color: this.color });
	}
}