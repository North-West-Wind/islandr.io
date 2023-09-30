import * as fs from "fs";
import { CircleHitbox } from "../../types/math";
import Item from "./item";
import { world } from "../..";
import Player from "./player";

export default class Vest extends Item {
	static readonly VEST_REDUCTION: number[] = [];
	type = "vest";
	hitbox = new CircleHitbox(1);
	level: number;

	static {
		const data = JSON.parse(fs.readFileSync("../data/config/vest_reduction.json", { encoding: "utf8" }));
		this.VEST_REDUCTION.push(...data);
	}

	constructor(level: number) {
		super();
		this.level = level;
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
		world.onceSounds.push({"path": "items/vest_wear.mp3", "position": this.position})
		return true;
	}

	translationKey() {
		return `${super.translationKey()} ${this.level}`;
	}

	minimize() {
		return Object.assign(super.minimize(), { level: this.level });
	}
}