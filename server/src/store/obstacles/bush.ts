import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";

export default class Bush extends Obstacle {
	type = "bush";
	noCollision = true;

	constructor() {
		const hitbox = new CircleHitbox(2.5);
		super(world, hitbox, hitbox, 100, 100);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacle/hit/bush/bush_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `obstacle/break/bush/bush_break.mp3`, position: this.position });
	}
}