import { world } from "../..";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { spawnGrenade } from "../../utils";

export default class GrenadeCrate extends Obstacle {
	type = "grenade_crate";

	constructor() {
		const hitbox = new RectHitbox(3, 3);
		super(world, hitbox, hitbox.scaleAll(0.75), 100, 100);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// Spawn 3 entities
		for (let ii = 0; ii < 3; ii++)
			spawnGrenade("frag_grenade", 2, this.position);
	}
}