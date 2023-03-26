import { world } from "../..";
import { CircleHitbox, Vec2 } from "../../types/math";
import Item from "./item";
import Player from "./player";

export default class Backpack extends Item {
	type = "backpack";
	hitbox = new CircleHitbox(1);
	level: number;

	constructor(level: number) {
		super();
		this.level = level;
	}

	picked(player: Player) {
		if (player.inventory.backpackLevel >= this.level) {
			this.randomVelocity(this.position.addVec(player.position.inverse()));
			return false;
		}
		if (player.inventory.backpackLevel != 0) {
			const backpack = new Backpack(player.inventory.backpackLevel);
			backpack.position = player.position;
			world.entities.push(backpack);
		}
		player.inventory.backpackLevel = this.level;
		return true;
	}

	minimize() {
		return Object.assign(super.minimize(), { level: this.level });
	}
}