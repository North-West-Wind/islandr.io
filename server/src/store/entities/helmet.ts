import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import Item from "./item";
import Player from "./player";

export default class Helmet extends Item {
	type = "helmet";
	name: string;
	hitbox = new CircleHitbox(1);
	level: number;

	constructor(level: number) {
		super();
		this.level = level;
		this.name = `Level ${this.level} Helmet`
	}

	picked(player: Player) {
		if (player.inventory.helmetLevel >= this.level) {
			this.randomVelocity(this.position.addVec(player.position.inverse()));
			return false;
		}
		if (player.inventory.helmetLevel != 0) {
			const helmet = new Helmet(player.inventory.helmetLevel);
			helmet.position = player.position;
			world.entities.push(helmet);
		}
		player.inventory.helmetLevel = this.level;
		return true;
	}

	minimize() {
		return Object.assign(super.minimize(), { level: this.level });
	}
}