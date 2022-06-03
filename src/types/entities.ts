import { MAP_SIZE } from "../constants";
import { clamp } from "../utils";
import { CircleHitbox, Hitbox, RectHitbox, Vec2 } from "./maths";

export class Entity {
	type: string = "";
	position: Vec2;
	velocity: Vec2 = Vec2.ZERO;
	direction: Vec2 = Vec2.ONE;
	hitbox: Hitbox = CircleHitbox.ZERO;

	constructor() {
		this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0], (Math.random() + 1) * MAP_SIZE[1]);
	}

	tick() {
		this.position = this.position.addVec(this.velocity);
		this.position = new Vec2(clamp(this.position.x, 0, MAP_SIZE[0]), clamp(this.position.y, 0, MAP_SIZE[1]));
	}

	setVelocity(velocity: Vec2) {
		this.velocity = velocity;
	}

	setDirection(direction: Vec2) {
		this.direction = direction.unit();
	}

	entityCollided(entity: Entity) {
		if (this.hitbox.type === "circle" && entity.hitbox.type === "circle") return this.position.addVec(entity.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>entity.hitbox).radius, 2);
		else if (this.hitbox.type === "rect" && entity.hitbox.type === "rect") {
			const thisHalfWidth = (<RectHitbox>this.hitbox).width / 2, thisHalfHeight = (<RectHitbox>this.hitbox).height / 2;
			const thesePoints = [this.position.addX(-thisHalfWidth), this.position.addX(thisHalfWidth), this.position.addY(-thisHalfHeight), this.position.addY(thisHalfHeight)];
			const thatHalfWidth = (<RectHitbox>entity.hitbox).width / 2, thatHalfHeight = (<RectHitbox>entity.hitbox).height / 2;
			const thosePoints = [this.position.addX(-thatHalfWidth), this.position.addX(thatHalfWidth), this.position.addY(-thatHalfHeight), this.position.addY(thatHalfHeight)];

			for (const point of thesePoints) if (thosePoints[0].x < point.x && thosePoints[1].x > point.x && thosePoints[2].y < point.y && thosePoints[3].y > point.y) return true;
			return false;
		} else {
			if (this.hitbox.type === "circle") return check(this, entity);
			else return check(entity, this);
			function check(circle: Entity, rect: Entity) {
				const subtracted = circle.position.addVec(rect.position.inverse());
				const cirDist = { x: Math.abs(subtracted.x), y: Math.abs(subtracted.y) };
				const halfWidth = (<RectHitbox>rect.hitbox).width / 2, halfHeight = (<RectHitbox>rect.hitbox).height / 2, radius = (<CircleHitbox> circle.hitbox).radius;

				if (cirDist.x > (halfWidth + radius)) { return false; }
				if (cirDist.y > (halfHeight + radius)) { return false; }

				if (cirDist.x <= halfWidth) { return true; }
				if (cirDist.y <= halfHeight) { return true; }

				return (Math.pow(cirDist.x - halfWidth, 2) + Math.pow(cirDist.y - halfHeight, 2) <= radius * radius);
			}
		}
	}
}

export class Player extends Entity {
	type = "player";
	id: string;
	health: number = 100;
	boost: number = 1;
	scope: number = 1;

	constructor(id: string) {
		super();
		this.id = id;
	}

	setVelocity(velocity: Vec2) {
		super.setVelocity(velocity.scaleAll(this.boost));
	}
}

export class Bullet extends Entity {
	type = "bullet";
	damage: number;
	ticks: number;

	constructor(damage: number, velocity: Vec2, ticks: number) {
		super();
		this.damage = damage;
		this.velocity = velocity;
		this.ticks = ticks;
	}
}