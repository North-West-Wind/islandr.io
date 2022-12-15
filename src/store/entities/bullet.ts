import { addParticles } from "../..";
import { Entity } from "../../types/entities";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { Particle } from "../../types/particles";

export default class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	discardable = true;
	shooter: Entity | GameObject;
	dmg: number;
	despawning = false;

	constructor(shooter: Entity | GameObject, dmg: number, velocity: Vec2, ticks: number) {
		super();
		this.shooter = shooter;
		this.dmg = dmg;
		this.velocity = velocity;
		this.health = this.maxHealth = ticks;
		this.vulnerable = false;
	}

	tick(entities: Entity[], objects: GameObject[]) {
		super.tick(entities, objects);
		var combined: (Entity | GameObject)[] = [];
		combined = combined.concat(entities, objects);
		if (!this.despawn)
			for (const thing of combined)
				if (thing.collided(this.hitbox, this.position, this.direction)) {
					thing.damage(this.dmg);
					this.die();
					break;
				}
		// In case the bullet is moving too fast, check for hitbox intersection
		if (!this.despawn)
			for (const thing of combined) {
				if (thing.hitbox.lineIntersects(new Line(this.position, this.position.addVec(this.velocity)), thing.position, thing.direction)) {
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

	die() {
		super.die();
		addParticles(new Particle("blood", this.position));
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { dmg: this.dmg });
	}
}