import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { GunWeapon } from "../../types/weapon";
import { randomBetween, spawnAmmo, spawnGun } from "../../utils";
import { WEAPON_SUPPLIERS } from "../weapons";

class StoneSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Stone(data.special || "normal")
	}
}

export default class Stone extends Obstacle {
	static readonly TYPE = "stone";
	type = Stone.TYPE;
	special: "normal" | "ak47";

	constructor(special: "normal" | "ak47" = "normal") {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(2).scaleAll(salt), new CircleHitbox(1.5).scaleAll(salt), 250, 250);
		this.special = special;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Stone.TYPE, new StoneSupplier());
	}

	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `objects/stone/stone_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		switch (this.special) {
			case "ak47": {
				const ak47 = <GunWeapon>WEAPON_SUPPLIERS.get("ak47")?.create();
				if (ak47)
					spawnGun(ak47.id, ak47.color, this.position, ak47.ammo);
			}
		}
		world.onceSounds.push({ path: `objects/stone/stone_break.mp3`, position: this.position });
	}

	minimize() {
		return Object.assign(super.minimize(), { special: this.special });
	}

	minmin() {
		return Object.assign(super.minmin(), { special: this.special });
	}
}