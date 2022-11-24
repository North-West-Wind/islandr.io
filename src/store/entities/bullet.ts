import { Entity } from "../../types/entities";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";

export default class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	discardable = true;
	dmg: number;
	despawning = false;

	constructor(dmg: number, velocity: Vec2, ticks: number) {
		super();
		this.dmg = dmg;
		this.velocity = velocity;
		this.health = this.maxHealth = ticks;
		this.vulnerable = false;
	}

	tick(entities: Entity[], objects: GameObject[]) {
		if (this.despawning) {
			if (this.animation.duration) return this.animation.duration--;
			else return this.die();
		}
		super.tick(entities, objects);
		var combined: (Entity | GameObject)[] = [];
		combined = combined.concat(entities, objects);
		if (!this.despawning)
			for (const thing of combined)
				if (thing.collided(this.hitbox, this.position, this.direction)) {
					thing.damage(this.dmg);
					this.startDespawn();
					break;
				}
		// In case the bullet is moving too fast, check for hitbox intersection
		if (!this.despawning)
			for (const thing of combined) {
				if (thing.hitbox.lineIntersects(new Line(this.position, this.position.addVec(this.velocity)), thing.position, thing.direction)) {
					thing.damage(this.dmg);
					this.startDespawn();
					break;
				}
			} 

		if (!this.despawning) {
			this.health--;
			if (this.health <= 0) this.die();
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { dmg: this.dmg, despawning: this.despawning });
	}

	private startDespawn() {
		this.despawning = true;
		this.animation = { name: "blood", duration: 50 };
	}
}