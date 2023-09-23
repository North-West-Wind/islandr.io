// Note: This is the grenade item

import { Inventory } from "../../types/entity";
import { CircleHitbox, Vec2 } from "../../types/math";
import { WEAPON_SUPPLIERS } from "../weapons";
import Item from "./item";
import Player from "./player";

export default class Grenade extends Item {
	type = "grenade";
	hitbox = new CircleHitbox(1);
	nameId: string; // grenade ID, but id was taken for entity already
	amount: number;

	constructor(nameId: string, amount: number) {
		super();
		if (!WEAPON_SUPPLIERS.has(nameId)) console.warn("Creating a grenade entity that doesn't have a supplier for its type");
		this.nameId = nameId;
		this.amount = amount;
		
	}

	picked(player: Player) {
		const newAmount = Math.min(Inventory.maxUtilities[player.inventory.backpackLevel].get(this.nameId) || 0, (player.inventory.utilities[this.nameId] || 0) + this.amount);
		const delta = newAmount - (player.inventory.utilities[this.nameId] || 0);
		player.inventory.utilities[this.nameId] = newAmount;
		if (delta != this.amount) {
			this.amount -= delta;
			this.setVelocity(Vec2.UNIT_X.addAngle(this.position.addVec(player.position.inverse()).angle()).scaleAll(0.001));
			return false;
		}
		player.inventory.utilOrder.add(this.nameId);
		player.inventory.fourthSlot();
		return true;
	}

	translationKey() {
		return `${super.translationKey()}.${this.nameId}`;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { nameId: this.nameId });
	}
}