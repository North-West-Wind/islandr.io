import { MAP_SIZE } from "../../constants";
import { CircleHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";

export default class Tree extends GameObject {
	type = "tree";

	constructor(objects: GameObject[]) {
		const salt = 1 + (Math.random() - 0.5) / 5;
		super(new CircleHitbox(1.2).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		while (objects.find(object => object.collided(this.hitbox, this.position, this.direction))) this.position = new Vec2(Math.random() * MAP_SIZE[0], Math.random() * MAP_SIZE[1]);
	}
}