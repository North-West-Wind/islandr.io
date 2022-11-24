import { MAP_SIZE } from "../../constants";
import { RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";

export default class Crate extends GameObject {
	type = "crate";

	constructor(objects: GameObject[]) {
		const hitbox = new RectHitbox(4, 4);
		super(hitbox, hitbox.scaleAll(0.75), 100, 100);
		while (objects.find(object => this.collided(object.hitbox, object.position, object.direction))) this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
	}

	die() {
		// TODO: Spawn loots
	}
}