import { world } from "../..";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { GunColor } from "../../types/misc";
import { Gun } from "../entities";
import { spawnAmmo, spawnGun } from "../../utils";

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
		let gunList = ["m9", "m870", "mp5", "m1100", "mp220"];
		let gunColorList = [GunColor.YELLOW, GunColor.RED, GunColor.YELLOW, GunColor.RED, GunColor.RED];
		let gunNumAmmo = [[22, 23], [5, 5], [45, 45], [6, 6], [5, 5]];
		let GunIndex = Math.floor(Math.random() * (5 - 0 ) + 0);
		spawnGun(gunList[GunIndex], gunColorList[GunIndex], this.position);
		for (let ii=0; ii<2; ii++ ){spawnAmmo(gunNumAmmo[GunIndex][ii], gunColorList[GunIndex], this.position);}
		// spawnAmmo(22, GunColor.YELLOW, this.position);
		// spawnAmmo(23, GunColor.YELLOW, this.position);
	}
}