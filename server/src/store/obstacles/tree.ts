import { MAP_OBSTACLE_SUPPLIERS, OBSTACLE_SUPPLIERS } from ".";
import { world } from "../..";
import { MapObstacleData, ObstacleData } from "../../types/data";
import { CircleHitbox } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MapObstacleSupplier, ObstacleSupplier } from "../../types/supplier";
import { GunWeapon } from "../../types/weapon";
import { randomBetween, spawnGun } from "../../utils";
import { WEAPON_SUPPLIERS } from "../weapons";

class TreeSupplier extends ObstacleSupplier {
	make(data: ObstacleData) {
		return new Tree(data.special || "normal");
	}
}

class TreeMapSupplier extends MapObstacleSupplier {
	make(data: MapObstacleData) {
		return new Tree(data.args ? data.args[0] : "normal");
	}
}

export default class Tree extends Obstacle {
	static readonly TYPE = "tree";
	type = Tree.TYPE;
	special: "normal" | "mosin";
	damageParticle = "wood";

	constructor(special: "normal" | "mosin" = "normal") {
		const salt = randomBetween(0.9, 1.1);
		super(world, new CircleHitbox(1.5).scaleAll(salt), new CircleHitbox(0.8).scaleAll(salt), 180, 180);
		this.special = special;
	}

	static {
		OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeSupplier());
		MAP_OBSTACLE_SUPPLIERS.set(Tree.TYPE, new TreeMapSupplier());
	}
	
	damage(dmg: number) {
		super.damage(dmg);
		world.onceSounds.push({ path: `obstacles/tree_hit.mp3`, position: this.position });
	}

	die() {
		super.die();
		switch (this.special) {
			case "mosin": {
				const mosin = <GunWeapon>WEAPON_SUPPLIERS.get("mosin_nagant")?.create();
				if (mosin)
					spawnGun(mosin.nameId, mosin.color, this.position, mosin.ammo);
				break;
			}
		}
		world.onceSounds.push({ path: "obstacles/tree_break.mp3", position: this.position });
	}

	minimize() {
		return Object.assign(super.minimize(), { special: this.special });
	}

	minmin() {
		return Object.assign(super.minmin(), { special: this.special });
	}
}