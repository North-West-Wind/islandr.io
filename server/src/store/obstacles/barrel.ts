import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";
import Explosion from "../entities/explosion";
import Roof from "./roof";
export default class Barrel extends Obstacle {
	type = "barrel";

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(2).scaleAll(salt), new CircleHitbox(1.5).scaleAll(salt), 250, 250);
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `objects/Barrel_Hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		world.onceSounds.push({ path: `objects/barrel_explosion.mp3`, position: this.position });
		world.entities.push(new Explosion(this, 150, 50, this.position, this.hitbox.comparable, 4, 20));
	}
}