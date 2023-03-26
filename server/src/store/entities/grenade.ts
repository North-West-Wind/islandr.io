// Note: This is the grenade item

import { CircleHitbox } from "../../types/math";
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
		// TODO: Check if there is enough space
		player.inventory.utilities.set(this.name, (player.inventory.utilities.get(this.name) || 0) + this.amount);
		return true;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { name: this.name, });
	}
}