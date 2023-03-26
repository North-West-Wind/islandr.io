// Note: This is the grenade item

import { Inventory } from "../../types/entity";
import { CircleHitbox, Vec2 } from "../../types/math";
import { WEAPON_SUPPLIERS } from "../weapons";
import Item from "./item";
import Player from "./player";

export default class Grenade extends Item {
	type = "grenade";
	hitbox = new CircleHitbox(1);
	name: string; // grenade ID, but id was taken for entity already
	amount: number;
	friction = 0.02; // frictional acceleration, not force

	constructor(name: string, amount: number) {
		super();
		if (!WEAPON_SUPPLIERS.has(name)) console.warn("Creating a grenade entity that doesn't have a supplier for its type");
		this.name = name;
		this.amount = amount;
		this.discardable = true;
		this.noCollision = true;
		this.vulnerable = false;
	}

	picked(player: Player) {
		const newAmount = Math.min(Inventory.maxUtilities[player.inventory.backpackLevel].get(this.name) || 0, (player.inventory.utilities.get(this.name) || 0) + this.amount);
		const delta = newAmount - (player.inventory.utilities.get(this.name) || 0);
		player.inventory.utilities.set(this.name, newAmount);
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