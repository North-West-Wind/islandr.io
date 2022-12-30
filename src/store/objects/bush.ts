import { CircleHitbox } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { World } from "../../types/terrain";

export default class Bush extends GameObject {
	type = "bush";
	noCollision = true;

	constructor(world: World) {
		const hitbox = new CircleHitbox(2);
		super(world, hitbox, hitbox, 100, 100);
		while (world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}
}