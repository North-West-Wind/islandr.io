import { MAP_SIZE } from "../constants";
import { Entity } from "./entities";
import { Vec2, Hitbox, CircleHitbox, RectHitbox } from "./maths";

export class GameObject {
	type: string = "";
	position: Vec2;
	baseHitbox: Hitbox;
	minHitbox: Hitbox;
	hitbox: Hitbox;
	vulnerable = true;
	health: number;
	maxHealth: number;
	despawn = false;

	constructor(baseHitbox: Hitbox, minHitbox: Hitbox, health: number, maxHealth: number) {
		if (baseHitbox.type !== minHitbox.type) throw new Error("Hitboxes are not the same type!");
		this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
		this.baseHitbox = this.hitbox = baseHitbox;
		this.minHitbox = minHitbox;
		this.health = health;
		this.maxHealth = maxHealth;
	}

	damage(dmg: number) {
		if (this.despawn || !this.vulnerable) return;
		this.health -= dmg;
		if (this.health <= 0) this.die();
		this.hitbox = this.baseHitbox.scaleAll(this.health / this.maxHealth + this.minHitbox.comparable() / this.baseHitbox.comparable());
	}

	die() {
		this.despawn = true;
	}
}

export class Tree extends GameObject {
	type = "tree";
	
	constructor(objects: GameObject[]) {
		const salt = 1 + (Math.random() - 0.5) / 5;
		super(new CircleHitbox(1.2).scaleAll(salt), new CircleHitbox(0.5).scaleAll(salt), 160, 160);
		//while (objects.find(object => this.collided(object))) this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
	}
}
export class Bush extends GameObject {
	type = "bush";
	
	constructor(objects: GameObject[]) {
		const salt = 1 + (Math.random() - 0.5) / 5;
		super(new CircleHitbox(1.2).scaleAll(salt), new CircleHitbox(0.5).scaleAll(salt), 160, 160);
		//while (objects.find(object => this.collided(object))) this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
	}
	// Hitbox collision check
//	collided(thing: Entity | GameObject) {
//		// For circle it is distance < sum of radii
//		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2);
//		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
//			// Check for each point to see if it falls into another rectangle
//			const thisHalfWidth = (<RectHitbox>this.hitbox).width / 2, thisHalfHeight = (<RectHitbox>this.hitbox).height / 2;
//			const thesePoints = [this.position.addX(-thisHalfWidth), this.position.addX(thisHalfWidth), this.position.addY(-thisHalfHeight), this.position.addY(thisHalfHeight)];
//			const thatHalfWidth = (<RectHitbox>thing.hitbox).width / 2, thatHalfHeight = (<RectHitbox>thing.hitbox).height / 2;
//			const thosePoints = [this.position.addX(-thatHalfWidth), this.position.addX(thatHalfWidth), this.position.addY(-thatHalfHeight), this.position.addY(thatHalfHeight)];
//
//			for (const point of thesePoints) if (thosePoints[0].x < point.x && thosePoints[1].x > point.x && thosePoints[2].y < point.y && thosePoints[3].y > point.y) return true;
//			return false;
//		} else {
//			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
//			// Not the best answer, but good enough.
//			if (this.hitbox.type === "circle") return check(this, thing);
//			else return check(thing, this);
//			function check(circle: Entity | GameObject, rect: Entity | GameObject) {
//				const subtracted = circle.position.addVec(rect.position.inverse());
//				const cirDist = { x: Math.abs(subtracted.x), y: Math.abs(subtracted.y) };
//				const halfWidth = (<RectHitbox>rect.hitbox).width / 2, halfHeight = (<RectHitbox>rect.hitbox).height / 2, radius = (<CircleHitbox>circle.hitbox).radius;
//
//				if (cirDist.x > (halfWidth + radius)) { return false; }
//				if (cirDist.y > (halfHeight + radius)) { return false; }
//
//				if (cirDist.x <= halfWidth) { return true; }
//				if (cirDist.y <= halfHeight) { return true; }
//
//				return (Math.pow(cirDist.x - halfWidth, 2) + Math.pow(cirDist.y - halfHeight, 2) <= radius * radius);
//			}
//		}
//	}
}
