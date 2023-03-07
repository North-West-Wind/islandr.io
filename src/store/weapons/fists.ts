import { WEAPON_SUPPLIERS } from ".";
import { WeaponSupplier } from "../../types/supplier";
import { Entity } from "../../types/entity";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MeleeWeapon } from "../../types/weapon";

class FistsSupplier implements WeaponSupplier {
	create() {
		return new Fists();
	}
}

export default class Fists extends MeleeWeapon {
	static readonly ID = "fists";
	id = Fists.ID;
	name = "Fists";
	continuous = false;
	animations = ["left_fist", "right_fist"];
	duration = 50;
	damage = 24;
	hitbox = new RectHitbox(1, 1);
	distance = new Vec2(1.5, 0);
	rotation = Vec2.UNIT_X;
	delay = 25;

	static {
		WEAPON_SUPPLIERS.set(Fists.ID, new FistsSupplier());
	}
	
	attack(attacker: Entity, entities: Entity[], obstacles: Obstacle[]) {
		const index = Math.floor(Math.random() * this.animations.length);
		attacker.animations.push(this.animations[index]);

		this.damageThing(attacker, entities, obstacles);
	}
}