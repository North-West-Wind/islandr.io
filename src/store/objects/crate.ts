import { addEntities } from "../..";
import { MAP_SIZE } from "../../constants";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { GunColor } from "../../types/misc";
import { Gun } from "../entities";

export default class Crate extends GameObject {
	type = "crate";

	constructor(objects: GameObject[]) {
		const hitbox = new RectHitbox(4, 4);
		super(hitbox, hitbox.scaleAll(0.75), 80, 80);
		this.direction = Vec2.ONE;
		while (objects.find(object => object.collided(this.hitbox, this.position, this.direction))) this.position = new Vec2(Math.random() * MAP_SIZE[0], Math.random() * MAP_SIZE[1]);
	}

	die() {
		super.die();
		// TODO: Spawn loots
		const gun = new Gun("m9", GunColor.YELLOW);
		gun.position = this.position;
		gun.velocity = Vec2.ONE.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.05);
		addEntities(gun);
	}
}