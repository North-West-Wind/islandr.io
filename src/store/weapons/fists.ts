import { TICKS_PER_SECOND } from "../../constants";
import { Entity } from "../../types/entities";
import { RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { MeleeWeapon } from "../../types/weapons";

export default class Fists extends MeleeWeapon {
	id = "fists";
	name = "Fists";
	continuous = false;
	animations = ["left_fist", "right_fist"];
	durations = [50, 50];
	damage = 24;
	hitbox = new RectHitbox(2, 1);
	distance = new Vec2(2, 0);
	rotation = Vec2.ONE;
	delay = 25;
	
	attack(attacker: Entity, entities: Entity[], objects: GameObject[]) {
		const index = Math.floor(Math.random() * this.animations.length);
		attacker.animation.name = this.animations[index];
		attacker.animation.duration = this.durations[index];

		setTimeout(() => {
			var combined: (Entity | GameObject)[] = [];
			combined = combined.concat(entities, objects);
			const angles = this.rotation.angle() + attacker.direction.angle();
			const position = attacker.position.addVec(this.distance.addAngle(angles));

			for (const thing of combined)
				if (thing.collided(this.hitbox, position, Vec2.ONE.addAngle(angles))) {
					thing.damage(this.damage);
					if (this.single) break;
				}
		}, this.delay * 1000 / TICKS_PER_SECOND);
	}
}