import { GLOBAL_UNIT_MULTIPLIER } from "../../constants";
import { TracerData } from "../../types/data";
import { Entity } from "../../types/entity";
import { CircleHitbox, Line, Vec2 } from "../../types/math";
import { Obstacle } from "../../types/obstacle";

export default class Bullet extends Entity {
	type = "bullet";
	collisionLayers = [0];
	shooter: Entity | Obstacle;
	data: TracerData;
	dmg: number;
	despawning = false;
	falloff: number;
	distanceSqr = 0;

	constructor(shooter: Entity | Obstacle, dmg: number, velocity: Vec2, ticks: number, falloff: number, data: TracerData) {
		super();
		this.hitbox = new CircleHitbox(data.width * GLOBAL_UNIT_MULTIPLIER / 2);
		this.shooter = shooter;
		this.data = data;
		this.dmg = dmg;
		this.direction = this.velocity = velocity;
		this.health = this.maxHealth = ticks;
		this.discardable = true;
		this.vulnerable = false;
		this.falloff = falloff;
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		const lastPos = this.position;
		super.tick(entities, obstacles);
		this.distanceSqr += this.position.addVec(lastPos.inverse()).magnitudeSqr();
		if (this.distanceSqr >= 10000) this.dmg *= this.falloff;
		var combined: (Entity | Obstacle)[] = [];
		combined = combined.concat(entities, obstacles);
		if (!this.despawn)
			for (const thing of combined)
				if (this.type != thing.type && thing.collided(this)) {
					thing.damage(this.dmg);
					if (!thing.noCollision) this.die();
					break;
				}
		// In case the bullet is moving too fast, check for hitbox intersection
		if (!this.despawn)
			for (const thing of combined) {
				if (this.type != thing.type && !thing.despawn && thing.hitbox.lineIntersects(new Line(this.position, this.position.addVec(this.velocity)), thing.position, thing.direction)) {
					thing.damage(this.dmg);
					if (!thing.noCollision) this.die();
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
		// Needs a state marker to determine what particle gets played
		//addParticles(new Particle("blood", this.position));
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { tracer: this.data });
	}
}