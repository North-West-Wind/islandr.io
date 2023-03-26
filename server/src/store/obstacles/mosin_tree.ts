import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";
import { GunColor } from "../../types/misc";
import { spawnGun } from "../../utils";
export default class MosinTree extends Obstacle {
	type = "tree";

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}
	die() {
		super.die();
		// TODO: Spawn loots
		spawnGun("mosin_nagant", GunColor.BLUE, this.position, 10);
		// spawnAmmo(15, GunColor.BLUE, this.position);
		// spawnAmmo(15, GunColor.BLUE, this.position);
	}
}