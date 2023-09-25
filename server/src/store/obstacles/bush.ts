import { MAP_OBSTACLE_SUPPLIERS, OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";

class BushSupplier extends ObstacleSupplier {
	make() {
		return new Bush();
	}
}

class BushMapSupplier extends MapObstacleSupplier {
	make() {
		return new Bush();
	}
}

export default class Bush extends Obstacle {
	static readonly TYPE = "bush";
	type = Bush.TYPE;
	noCollision = true;

	constructor() {
		const hitbox = new CircleHitbox(2.5);
		super(world, hitbox, hitbox, 100, 100);
	}

	static {
		OBSTACLE_SUPPLIERS.set(Bush.TYPE, new BushSupplier());
		MAP_OBSTACLE_SUPPLIERS.set(Bush.TYPE, new BushMapSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacles/bush_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `obstacles/bush_break.mp3`, position: this.position });
	}
}