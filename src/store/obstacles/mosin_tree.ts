import { world } from "../..";
import { CircleHitbox, CommonAngles, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";
import { GunColor } from "../../types/misc";
import { Gun} from "../entities";

export default class MosinTree extends Obstacle {
	type = "tree";

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}
	die() {
		super.die();
		// TODO: Spawn loots
		const gun = new Gun("mosin_nagant", GunColor.BLUE);
		gun.position = this.position;
		gun.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun);
	}
}