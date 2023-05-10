import { Inventory } from "../../types/entity";
import { CircleHitbox, Vec2 } from "../../types/math";
import Item from "./item";
import Player from "./player";

export default class Healing extends Item {
	type = "healing";
	hitbox = new CircleHitbox(1);
	name: string; // healing item ID, but id was taken for entity already
	amount: number;

	constructor(name: string, amount: number) {
		super();
		this.name = name;
		this.amount = amount;
	}

	picked(player: Player) {
		const newAmount = Math.min(Inventory.maxHealings[player.inventory.backpackLevel].get(this.name) || 0, (player.inventory.healings.get(this.name) || 0) + this.amount);
		const delta = newAmount - (player.inventory.healings.get(this.name) || 0);
		player.inventory.healings.set(this.name, newAmount);
		if (delta != this.amount) {
			this.amount -= delta;
			this.velocity = Vec2.UNIT_X.addAngle(this.position.addVec(player.position.inverse()).angle()).scaleAll(0.001);
			return false;
		}
		return true;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { name: this.name, });
	}
}