import { world } from "../..";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { LOOT_TABLES } from "../../types/loot_table";
import { ObstacleSupplier } from "../../types/supplier";
import { ObstacleData } from "../../types/data";
import { OBSTACLE_SUPPLIERS, Roof } from ".";

class CrateSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Crate(data.special || "normal");
	}
}

export default class Crate extends Obstacle {
	static readonly TYPE = "crate";
	type = Crate.TYPE;
	special: "normal" | "grenade" | "soviet" | "awc";

	constructor(special: "normal" | "grenade" | "soviet" | "awc" = "normal") {
		var hitbox: RectHitbox;
		var health: number;
		switch (special) {
			case "grenade":
				hitbox = new RectHitbox(3, 3);
				health = 100;
				break;
			case "soviet":
				hitbox = new RectHitbox(4, 4);
				health = 125;
				break;
			default:
				hitbox = new RectHitbox(4, 4);
				health = 80;
				break;
		}
		super(world, hitbox, hitbox.scaleAll(0.75), 80, 80, Vec2.UNIT_X);
		this.special = special;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Crate.TYPE, new CrateSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `objects/wood_break.mp3`, position: this.position });
	}

	die() {
		super.die();
		var lootTable: string;
		switch (this.special) {
			case "grenade":
				lootTable = "crate_grenade";
				break;
			case "soviet":
				lootTable = "crate_more";
				break;
			case "awc":
				lootTable = "crate_rare";
				break;
			default:
				lootTable = "crate";
				break;
		}
		const entities = LOOT_TABLES.get(lootTable)?.roll();
		if (entities) {
			world.entities.push(...entities.map(e => {
				e.position = this.position;
				return e;
			}));
		}
		world.onceSounds.push({ path: "objects/crate_break.mp3", position: this.position });
	}

	minimize() {
		return Object.assign(super.minimize(), { special: this.special });
	}

	minmin() {
		return Object.assign(super.minmin(), { special: this.special });
	}
}