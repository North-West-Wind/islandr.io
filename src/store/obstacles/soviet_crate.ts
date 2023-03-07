import { world } from "../..";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { GunColor } from "../../types/misc";
import { Ammo, Gun } from "../entities";
import { spawnAmmo, spawnGun } from "../../utils";

export default class SovietCrate extends Obstacle {
	type = "soviet_crate";

	constructor() {
		const hitbox = new RectHitbox(4, 4);
		super(world, hitbox, hitbox.scaleAll(0.75), 125, 125);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// TODO: Spawn loots
		spawnGun("m870", GunColor.RED, this.position);
		spawnGun("mp5", GunColor.YELLOW, this.position);
		for (let ii = 0; ii < 2; ii++)
			spawnAmmo(5, GunColor.RED, this.position);
		for (let ii = 0; ii < 2; ii++)
			spawnAmmo(45, GunColor.YELLOW, this.position);
	}
}