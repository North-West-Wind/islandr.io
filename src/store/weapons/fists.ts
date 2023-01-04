import { Entity } from "../../types/entity";
import { RectHitbox, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { MeleeWeapon } from "../../types/weapon";

export default class Fists extends MeleeWeapon {
	id = "fists";
	name = "Fists";
	continuous = false;
	animations = ["left_fist", "right_fist"];
	durations = [50, 50];
	damage = 24;
	hitbox = new RectHitbox(1, 1);
	distance = new Vec2(1.5, 0);
	rotation = Vec2.UNIT_X;
	delay = 25;
	
	attack(attacker: Entity, entities: Entity[], obstacles: Obstacle[]) {
		const index = Math.floor(Math.random() * this.animations.length);
		attacker.animation.name = this.animations[index];
		attacker.animation.duration = this.durations[index];

		this.damageThing(attacker, entities, obstacles);
	}
}