import * as fs from "fs";
import { Inventory } from "../../types/entity";
import { CircleHitbox, Vec2 } from "../../types/math";
import Item from "./item";
import Player from "./player";
import { HealingData } from "../../types/data";
import { world } from "../..";

export default class Healing extends Item {
	static readonly healingData = new Map<string, { heal: number, boost: number, time: number }>();
	type = "healing";
	hitbox = new CircleHitbox(1);
	nameId: string; // healing item ID, but id was taken for entity already
	amount: number;

	constructor(nameId: string, amount: number) {
		super();
		this.nameId = nameId;
		this.amount = amount;
	}

	static {
		for (const file of fs.readdirSync("../data/healings/")) {
			if (file.startsWith(".")) continue;
			const data = <HealingData> JSON.parse(fs.readFileSync("../data/healings/" + file, { encoding: "utf8" }));
			const id = file.split(".").slice(0, -1).join(" ");
			this.healingData.set(id, { heal: data.heal, boost: data.boost, time: data.time });
		}
	}

	picked(player: Player) {
		const newAmount = Math.min(Inventory.maxHealings[player.inventory.backpackLevel].get(this.nameId) || 0, (player.inventory.healings[this.nameId] || 0) + this.amount);
		const delta = newAmount - (player.inventory.healings[this.nameId] || 0);
		player.inventory.healings[this.nameId] = newAmount;
		world.onceSounds.push({"path": `items/${this.nameId}_pickup.mp3`, position:this.position})
		if (delta != this.amount) {
			this.amount -= delta;
			this.setVelocity(Vec2.UNIT_X.addAngle(this.position.addVec(player.position.inverse()).angle()).scaleAll(0.001));
			return false;
		}
		return true;
	}

	translationKey() {
		return `${super.translationKey()}.${this.nameId} ${this.amount}`;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { nameId: this.nameId, });
	}
}