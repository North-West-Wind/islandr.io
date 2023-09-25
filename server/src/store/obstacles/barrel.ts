import { MAP_OBSTACLE_SUPPLIERS, OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";
import { randomBetween } from "../../utils";
import Explosion from "../entities/explosion";

class BarrelSupplier extends ObstacleSupplier {
	make() {
		return new Barrel();
	}
}

class BarrelMapSupplier extends MapObstacleSupplier {
	make() {
		return new Barrel();
	}
}

export default class Barrel extends Obstacle {
	static readonly TYPE = "barrel";
	type = Barrel.TYPE;

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(2).scaleAll(salt), new CircleHitbox(1.5).scaleAll(salt), 250, 250);
	}

	static {
		OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelSupplier());
		MAP_OBSTACLE_SUPPLIERS.set(Barrel.TYPE, new BarrelMapSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacles/barrel_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `obstacles/barrel_explosion.mp3`, position: this.position });
		world.entities.push(new Explosion(this, 150, 50, this.position, this.hitbox.comparable, 4, 20));
	}
}