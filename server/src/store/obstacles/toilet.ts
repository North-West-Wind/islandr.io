import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { LOOT_TABLES } from "../../types/loot_table";
import { ObstacleSupplier } from "../../types/supplier";
import { ObstacleData } from "../../types/data"; 
import { OBSTACLE_SUPPLIERS } from ".";

class ToiletSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Toilet();
	}
}
export default class Toilet extends Obstacle {
	static readonly TYPE = "toilet";
	type = Toilet.TYPE;

	constructor() {
		const hitbox = new CircleHitbox(1.2);
		super(world, hitbox, hitbox.scaleAll(0.5), 120, 120);
	}

	static {
		OBSTACLE_SUPPLIERS.set(Toilet.TYPE, new ToiletSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacles/toilet_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		const entities = LOOT_TABLES.get("toilet")?.roll();
		if (entities) {
			world.entities.push(...entities.map(e => {
				e.position = this.position;
				return e;
			}));
		}
		world.onceSounds.push({ path: `obstacles/toilet_break.mp3`, position: this.position });
	}
}