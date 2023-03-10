import { world } from "../..";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { GunColor } from "../../types/misc";
import { spawnAmmo, spawnGun } from "../../utils";

export default class AWMCrate extends Obstacle {
	type = "AWMCrate";

	constructor() {
		const hitbox = new RectHitbox(4, 4);
		super(world, hitbox, hitbox.scaleAll(0.75), 80, 80);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// TODO: Spawn loots
		spawnGun("awm", GunColor.SUBSONIC, this.position);
		spawnAmmo(10, GunColor.SUBSONIC, this.position);
		spawnAmmo(10, GunColor.SUBSONIC, this.position);
	}
}