import { CircleHitbox } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { World } from "../../types/terrain";

export default class Tree extends GameObject {
	type = "tree";

	constructor(world: World) {
		const salt = 1 + (Math.random() - 0.5) / 5;
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		while (world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}
}