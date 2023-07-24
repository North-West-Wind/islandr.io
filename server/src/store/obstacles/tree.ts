import { OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { ObstacleData } from "../../types/data";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { ObstacleSupplier } from "../../types/supplier";
import { GunWeapon } from "../../types/weapon";
import { randomBetween, spawnGun } from "../../utils";
import { WEAPON_SUPPLIERS } from "../weapons";

class TreeSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Tree(data.special || "normal");
	}
}

export default class Tree extends Obstacle {
	static readonly TYPE = "tree";
	type = Tree.TYPE;
	special: "normal" | "mosin";

	constructor(special: "normal" | "mosin" = "normal") {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		this.special = special;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeSupplier());
	}
	
	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacle/hit/wood/wood_hit_01.mp3`, position: this.position });
	}

	die() {
		super.die();
		switch (this.special) {
			case "mosin": {
				const mosin = <GunWeapon>WEAPON_SUPPLIERS.get("mosin_nagant")?.create();
				if (mosin)
					spawnGun(mosin.id, mosin.color, this.position, mosin.ammo);
				break;
			}
		}
		world.onceSounds.push({ path: "objects/tree_break.mp3", position: this.position });
	}

	minimize() {
		return Object.assign(super.minimize(), { special: this.special });
	}

	minmin() {
		return Object.assign(super.minmin(), { special: this.special });
	}
}