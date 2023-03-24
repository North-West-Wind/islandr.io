import { world } from "../..";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { GunColor } from "../../types/misc";
import { randomBetween, spawnGun } from "../../utils";

export default class Crate extends Obstacle {
	type = "crate";

	constructor() {
		const hitbox = new RectHitbox(4, 4);
		super(world, hitbox, hitbox.scaleAll(0.75), 80, 80);
		this.direction = Vec2.UNIT_X;
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// TODO: Spawn loots
		const gunList = ["m9", "m870", "mp5", "m1100", "ak47"];
		const gunColorList = [GunColor.YELLOW, GunColor.RED, GunColor.YELLOW, GunColor.RED, GunColor.BLUE];
		const gunNumAmmo = [60, 10, 90, 12, 90,];
		const GunIndex = Math.floor(randomBetween(0, 5));
		spawnGun(gunList[GunIndex], gunColorList[GunIndex], this.position, gunNumAmmo[GunIndex]);
		// for (let ii=0; ii<2; ii++ ){spawnAmmo(gunNumAmmo[GunIndex][ii], gunColorList[GunIndex], this.position);}
		// spawnAmmo(22, GunColor.YELLOW, this.position);
		// spawnAmmo(23, GunColor.YELLOW, this.position);
	}
}