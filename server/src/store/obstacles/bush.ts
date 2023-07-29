import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import Roof from "./roof";

export default class Bush extends Obstacle {
	type = "bush";
	noCollision = true;

	constructor() {
		const hitbox = new CircleHitbox(2.5);
		super(world, hitbox, hitbox, 100, 100);
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacle/hit/bush/bush_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `objects/bush_break.mp3`, position: this.position });
	}
}