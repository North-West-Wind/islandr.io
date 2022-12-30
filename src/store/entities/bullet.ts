import { addParticles } from "../..";
import { Entity } from "../../types/entity";
import { CircleHitbox, Line, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";
import { Particle } from "../../types/particle";

export default class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	discardable = true;
	shooter: Entity | Obstacle;
	dmg: number;
	despawning = false;

	constructor(shooter: Entity | Obstacle, dmg: number, velocity: Vec2, ticks: number) {
		super();
		this.shooter = shooter;
		this.dmg = dmg;
		this.velocity = velocity;
		this.health = this.maxHealth = ticks;
		this.vulnerable = false;
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		var combined: (Entity | Obstacle)[] = [];
		combined = combined.concat(entities, obstacles);
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