import { world } from "../..";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { GunColor } from "../../types/misc";
import { Ammo, Gun } from "../entities";

export default class SovietCrate extends Obstacle {
	type = "soviet_crate";

	constructor() {
		const hitbox = new RectHitbox(4, 4);
		super(world, hitbox, hitbox.scaleAll(0.75), 125, 125);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// TODO: Spawn loots
		const gun = new Gun("m870", GunColor.RED);
		gun.position = this.position;
		gun.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun);
		const gun2 = new Gun("mp5", GunColor.YELLOW);
		gun2.position = this.position;
		gun2.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun2);
		for (let ii = 0; ii < 2; ii++) {
			const ammo = new Ammo(5, GunColor.RED);
			ammo.position = this.position;
			ammo.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
			world.entities.push(ammo);
		}
		for (let ii = 0; ii < 2; ii++) {
			const ammo = new Ammo(45, GunColor.YELLOW);
			ammo.position = this.position;
			ammo.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
			world.entities.push(ammo);
		}
	}
}