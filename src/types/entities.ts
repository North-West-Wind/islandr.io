import { MAP_SIZE } from "../constants";
import { clamp } from "../utils";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "./maths";
import { GameObject } from "./objects";
import { Weapon } from "./weapons";
import { Fists } from "../store/weapons";

interface AttackAttribute {
	name: string;
	duration: number;
}

export interface Inventory {
	holding: number;
	weapons: Weapon[];
	slots: number;
}

const DEFAULT_EMPTY_INVENTORY = { holding: 2, weapons: Array(4), slots: 4 };
DEFAULT_EMPTY_INVENTORY.weapons[2] = new Fists();

export class Entity {
	type: string = "";
	position: Vec2;
	velocity: Vec2 = Vec2.ZERO;
	direction: Vec2 = Vec2.ONE;
	hitbox: Hitbox = CircleHitbox.ZERO;
	vulnerable = true;
	health: number = 100;
	maxHealth: number = 100;
	despawn = false;
	attack: AttackAttribute = { name: "", duration: 0 };
	inventory: Inventory;

	constructor() {
		// Currently selects a random position to spawn. Will change in the future.
		this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
		this.inventory = DEFAULT_EMPTY_INVENTORY;
	}

	tick(_entities: Entity[], _objects: GameObject[]) {
		// Add the velocity to the position, and cap it at map size.
		this.position = this.position.addVec(this.velocity);
		this.position = new Vec2(clamp(this.position.x, 0, MAP_SIZE[0]), clamp(this.position.y, 0, MAP_SIZE[1]));
		if (this.attack.name) {
			if (this.attack.duration > 0) this.attack.duration--;
			else this.attack.name = "";
		}
	}

	setVelocity(velocity: Vec2) {
		this.velocity = velocity;
	}

	setDirection(direction: Vec2) {
		this.direction = direction.unit();
	}

	// Hitbox collision check
	collided(thing: Entity | GameObject) {
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2);
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
			// Check for each point to see if it falls into another rectangle
			const thisHalfWidth = (<RectHitbox>this.hitbox).width / 2, thisHalfHeight = (<RectHitbox>this.hitbox).height / 2;
			const thesePoints = [this.position.addX(-thisHalfWidth), this.position.addX(thisHalfWidth), this.position.addY(-thisHalfHeight), this.position.addY(thisHalfHeight)];
			const thatHalfWidth = (<RectHitbox>thing.hitbox).width / 2, thatHalfHeight = (<RectHitbox>thing.hitbox).height / 2;
			const thosePoints = [this.position.addX(-thatHalfWidth), this.position.addX(thatHalfWidth), this.position.addY(-thatHalfHeight), this.position.addY(thatHalfHeight)];

			for (const point of thesePoints) if (thosePoints[0].x < point.x && thosePoints[1].x > point.x && thosePoints[2].y < point.y && thosePoints[3].y > point.y) return true;
			return false;
		} else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Not the best answer, but good enough.
			if (this.hitbox.type === "circle") return check(this, thing);
			else return check(thing, this);
			function check(circle: Entity | GameObject, rect: Entity | GameObject) {
				const subtracted = circle.position.addVec(rect.position.inverse());
				const cirDist = { x: Math.abs(subtracted.x), y: Math.abs(subtracted.y) };
				const halfWidth = (<RectHitbox>rect.hitbox).width / 2, halfHeight = (<RectHitbox>rect.hitbox).height / 2, radius = (<CircleHitbox>circle.hitbox).radius;

				if (cirDist.x > (halfWidth + radius)) { return false; }
				if (cirDist.y > (halfHeight + radius)) { return false; }

				if (cirDist.x <= halfWidth) { return true; }
				if (cirDist.y <= halfHeight) { return true; }

				return (Math.pow(cirDist.x - halfWidth, 2) + Math.pow(cirDist.y - halfHeight, 2) <= radius * radius);
			}
		}
	}

	damage(dmg: number) {
		if (!this.vulnerable) return;
		this.health -= dmg;
	}

	die() {
		this.despawn = true;
	}
}

export class Player extends Entity {
	type = "player";
	hitbox = new CircleHitbox(1);
	id: string;
	boost: number = 1;
	scope: number = 1;
	tryAttacking: boolean = false;

	constructor(id: string) {
		super();
		this.id = id;
	}

	setVelocity(velocity: Vec2) {
		// Also scale the velocity to boost by soda and pills
		super.setVelocity(velocity.scaleAll(this.boost));
	}

	tick(entities: Entity[], objects: GameObject[]) {
		super.tick(entities, objects);
		for (const object of objects) {
			if (this.collided(object)) {
				object.onCollision(this);
				if (!object.noCollision) {
					if (object.hitbox.type === "circle") {
						const relative = this.position.addVec(object.position.inverse());
						this.position = object.position.addVec(relative.scaleAll((object.hitbox.comparable() + this.hitbox.comparable()) / relative.magnitude()));
					} else if (object.hitbox.type === "rect") {
						// TODO: implement rectangular hitbox collision check
					}
				}
			}
		}
	}
}

export class Bullet extends Entity {
	type = "bullet";
	hitbox = new CircleHitbox(0.1);
	dmg: number;
	ticks: number;

	constructor(dmg: number, velocity: Vec2, ticks: number) {
		super();
		this.dmg = dmg;
		this.velocity = velocity;
		this.ticks = ticks;
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
	}
}