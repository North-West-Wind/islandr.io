import { world } from "../..";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";
import { MapObstacleData, ObstacleData } from "../../types/data";
import { MAP_OBSTACLE_SUPPLIERS, OBSTACLE_SUPPLIERS } from ".";

class TableSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Table();
	}
}

class TableMapObstacleSupplier extends MapObstacleSupplier {
	make(data: MapObstacleData) {
		return new Table();
	}
}

export default class Table extends Obstacle {
	static readonly TYPE = "table";
	type = Table.TYPE;
	damageParticle = "wood";
	noCollision = true;

	constructor() {
		var hitbox = new RectHitbox(5, 2);
		var health = 120;
		super(world, hitbox, hitbox.scaleAll(0.75), health, health, Vec2.UNIT_X);
	}

	static {
		OBSTACLE_SUPPLIERS.set(Table.TYPE, new TableSupplier());
		MAP_OBSTACLE_SUPPLIERS.set(Table.TYPE, new TableMapObstacleSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacles/crate_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: "obstacles/wood_break.mp3", position: this.position });
	}

	minimize() {
		return Object.assign(super.minimize());
	}

	minmin() {
		return Object.assign(super.minmin());
	}
}