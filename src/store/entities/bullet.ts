import { Entity } from "../../types/entities";
import { CircleHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";

export default class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	dmg: number;

	constructor(dmg: number, velocity: Vec2, ticks: number) {
		super();
		this.dmg = dmg;
		this.velocity = velocity;
		this.health = this.maxHealth = ticks;
		this.vulnerable = false;
	}

	tick(entities: Entity[], objects: GameObject[]) {
		super.tick(entities, objects);
		for (const object of objects) if (this.collided(object)) {
			object.damage(this.dmg);
			this.die();
			break;
		}
		if (!this.despawn) for (const entity of entities) if (this.collided(entity)) {
			entity.damage(this.dmg);
			this.die();
			break;
		}
		if (!this.despawn) {
			this.health--;
			if (this.health <= 0) this.die();
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { dmg: this.dmg });
	}
}