import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { World } from "../../types/terrain";

export default class Bush extends Obstacle {
	type = "bush";
	noCollision = true;

	constructor(world: World) {
		const hitbox = new CircleHitbox(2);
		super(world, hitbox, hitbox, 100, 100);
		while (world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}
}