import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";

export default class Stone extends Obstacle {
	type = "stone";

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(2).scaleAll(salt), new CircleHitbox(1.5).scaleAll(salt), 250, 250);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacle/hit/stone/stone_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `obstacle/break/stone/stone_break.mp3`, position: this.position });
	}
}