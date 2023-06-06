import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { LOOT_TABLES } from "../../types/loot_table";
import { ObstacleSupplier } from "../../types/supplier";
import { ObstacleData } from "../../types/data"; 
import { OBSTACLE_SUPPLIERS } from ".";
import { randomBetween } from "../../utils";

class ToiletSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Toilet();
	}
}
export default class Toilet extends Obstacle {
	static readonly TYPE = "toilet";
	type = Toilet.TYPE;

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1).scaleAll(salt), new CircleHitbox(0.5).scaleAll(salt), 120, 120);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}
	static {
		OBSTACLE_SUPPLIERS.set(Toilet.TYPE, new ToiletSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacle/hit/toilet/toilet_hit.mp3`, position: this.position });
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
		world.onceSounds.push({ path: `obstacle/break/toilet/toilet_break.mp3`, position: this.position });
	}
}