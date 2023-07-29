import { CircleHitbox } from "../../types/math";
import { MinEntity } from "../../types/minimized";
import Item from "./item";
import { world } from "../..";
import Player from "./player";

export default class Vest extends Item {
	type = "Vest";
	name: string;
	hitbox = new CircleHitbox(1);
	level: number;

	constructor(level: number) {
		super();
		this.level = level;
		this.name = ` Level ${this.level} Vest`
	}

	picked(player: Player) {
		if (player.inventory.vestLevel >= this.level) {
			this.randomVelocity(this.position.addVec(player.position.inverse()));
			return false;
		}
		if (player.inventory.vestLevel != 0) {
			const vest = new Vest(player.inventory.vestLevel);
			vest.position = player.position;
			world.entities.push(vest);
		}
		player.inventory.vestLevel = this.level;
		return true;
	}

	minimize() {
		return Object.assign(super.minimize(), { level: this.level });
	}
}