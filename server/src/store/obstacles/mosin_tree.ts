import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { randomBetween } from "../../utils";
import { spawnGun } from "../../utils";
import { GunWeapon } from "../../types/weapon";
import { WEAPON_SUPPLIERS } from "../weapons";
export default class MosinTree extends Obstacle {
	type = "tree";

	constructor() {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		while (world.terrainAtPos(this.position).id != "plain" || world.obstacles.find(obstacle => obstacle.collided(this))) this.position = world.size.scale(Math.random(), Math.random());
	}
	die() {
		super.die();
		const mosin = <GunWeapon>WEAPON_SUPPLIERS.get("mosin_nagant")?.create();
		if (mosin)
			spawnGun(mosin.id, mosin.color, this.position, mosin.ammo);
	}
}