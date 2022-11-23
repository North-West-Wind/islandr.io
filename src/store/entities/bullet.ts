import { Entity } from "../../types/entities";
import { CircleHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { lineCircleIntersect } from "../../utils";

export default class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	discardable = true;
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
		const combined: (Entity | GameObject)[] = [];
		combined.concat(entities, objects);
		for (const thing of combined) if (this.collided(thing)) {
			thing.damage(this.dmg);
			this.die();
			break;
		}
		// In case the bullet is moving too fast, check for hitbox intersection
		if (!this.despawn) for (const thing of combined) {
			if (
				thing.hitbox.type === "circle" && lineCircleIntersect(this.position, this.position.addVec(this.velocity), thing.position, thing.hitbox.comparable())
				||
				false // this is the part that checks line rectangle
			) {
				thing.damage(this.dmg);
				this.die();
				break;
			}
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