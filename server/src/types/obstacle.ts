import { Roof } from "../store/obstacles";
import { ID } from "../utils";
import { Entity } from "./entity";
import { Vec2, Hitbox, CircleHitbox, RectHitbox, CommonAngles } from "./math";
import { MinMinObstacle, MinObstacle } from "./minimized";
import { CollisionType } from "./misc";
import { World } from "./world";

export class Obstacle {
	id: string;
	type = "";
	position: Vec2;
	direction: Vec2;
	baseHitbox: Hitbox;
	minHitbox: Hitbox;
	hitbox: Hitbox;
	noCollision = false;
	collisionLayers = [-1]; // -1 means on all layers
	vulnerable = true;
	health: number;
	maxHealth: number;
	discardable = false;
	despawn = false;
	animations: string[] = [];
	dirty = true;
	// Particle type to emit when damaged
	damageParticle?: string;

	constructor(world: World, baseHitbox: Hitbox, minHitbox: Hitbox, health: number, maxHealth: number, direction?: Vec2) {
		if (baseHitbox.type !== minHitbox.type) throw new Error("Hitboxes are not the same type!");
		this.id = ID();
		this.direction = direction || Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI);
		this.baseHitbox = this.hitbox = baseHitbox;
		this.minHitbox = minHitbox;
		this.health = health;
		this.maxHealth = maxHealth;
		do {
			this.position = world.size.scale(Math.random(), Math.random());
		} while (world.terrainAtPos(this.position).id != world.defaultTerrain.id || world.obstacles.find(obstacle => obstacle.collided(this)) || world.buildings.some(b => b.obstacles.find(o => o.obstacle.type === Roof.ID)?.obstacle.collided(this)));
	}

	damage(dmg: number, damager?: string) {
		if (this.despawn || this.health <= 0 || !this.vulnerable) return;
		this.health -= dmg;
		if (this.health <= 0) this.die(damager);
		this.hitbox = this.baseHitbox.scaleAll(this.minHitbox.comparable / this.baseHitbox.comparable + (this.health / this.maxHealth) * (1 - this.minHitbox.comparable / this.baseHitbox.comparable));
		this.markDirty();
	}

	die(killer?: string) {
		this.despawn = true;
		this.health = 0;
		this.markDirty();
	}

	// Hitbox collision check
	collided(thing: Entity | Obstacle) {
		if (this.id == thing.id || this.despawn) return CollisionType.NONE;
		if (!this.collisionLayers.includes(-1) && !thing.collisionLayers.includes(-1) && !this.collisionLayers.some(layer => thing.collisionLayers.includes(layer))) return CollisionType.NONE;
		if (this.position.distanceTo(thing.position) > this.hitbox.comparable + thing.hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		// Reason this doesn't require additional checking: Look up 2 lines
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return CollisionType.CIRCLE_CIRCLE;
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") return this.hitbox.collideRect(this.position, this.direction, <RectHitbox><unknown>thing.hitbox, thing.position, thing.direction);
		else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Using the chosen answer
			// EDIT: I don't even know if this is the same answer anymore
			let circle: { hitbox: CircleHitbox, position: Vec2, direction: Vec2 };
			let rect: { hitbox: RectHitbox, position: Vec2, direction: Vec2 };
			if (this.hitbox.type === "circle") {
				circle = { hitbox: <CircleHitbox>this.hitbox, position: this.position, direction: this.direction };
				rect = { hitbox: <RectHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
			} else {
				circle = { hitbox: <CircleHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
				rect = { hitbox: <RectHitbox>this.hitbox, position: this.position, direction: this.direction };
			}
			return rect.hitbox.collideCircle(rect.position, rect.direction, circle.hitbox, circle.position, circle.direction);
		}
	}

	// No implementation by default
	onCollision(_thing: Entity | Obstacle) { }

	tick(_entities: Entity[], _obstacles: Obstacle[]) {
		if (this.vulnerable && this.health <= 0 && !this.despawn) this.die();
	}

	rotateAround(pivot: Vec2, angle: number) {
		this.direction = this.direction.addAngle(angle);
		this.position = pivot.addVec(this.position.addVec(pivot.inverse()).addAngle(angle));
		this.markDirty();
	}

	markDirty() {
		this.dirty = true;
	}

	unmarkDirty() {
		this.dirty = false;
	}

	minimize() {
		return <MinObstacle>{
			id: this.id,
			type: this.type,
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			hitbox: this.hitbox.minimize(),
			despawn: this.despawn,
			animations: this.animations
		};
	}

	minmin() {
		return <MinMinObstacle>{ id: this.id, type: this.type, position: this.position };
	}
}