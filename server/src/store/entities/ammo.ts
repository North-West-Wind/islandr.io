import { PUSH_THRESHOLD, TICKS_PER_SECOND } from "../../constants";
import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/math";
import { CollisionType, GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import Player from "./player";

export default class Ammo extends Entity implements PickupableEntity {
	type = "ammo";
	hitbox = new CircleHitbox(1);
	amount: number;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force

	constructor(amount: number, color: GunColor) {
		super();
		this.amount = amount;
		this.color = color;
		this.discardable = true;
		this.noCollision = true;
		this.vulnerable = false;
	}

	picked(player: Player) {
		player.inventory.ammos[this.color] += this.amount;
		return true;
	}
	
	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		var colliding = false;
		for (const entity of entities.filter(e => ["gun", "ammo"].includes(e.type) && e.id != this.id)) {
			if (this.collided(entity.hitbox, entity.position, entity.direction)) {
				const movement = this.position.addVec(entity.position.inverse());
				// Avoid doing sqrt more than once
				const mag = movement.magnitude();
				const safeDistance = this.hitbox.comparable + entity.hitbox.comparable;
				this.velocity = this.velocity.addVec(movement.scaleAll(((safeDistance - mag) / safeDistance) / (mag * TICKS_PER_SECOND * 20)));
				colliding = true;
			}
		}
		if (!colliding) this.velocity = this.velocity.scaleAll(1 - this.friction);
		for (const obstacle of obstacles) {
			const collisionType = obstacle.collided(this.hitbox, this.position, this.direction);
			if (collisionType) {
				obstacle.onCollision(this);
				if (!obstacle.noCollision) {
					if (collisionType == CollisionType.CIRCLE_CIRCLE) this.handleCircleCircleCollision(obstacle);
					else if (collisionType == CollisionType.CIRCLE_RECT_CENTER_INSIDE) this.handleCircleRectCenterCollision(obstacle);
					else if (collisionType == CollisionType.CIRCLE_RECT_POINT_INSIDE) this.handleCircleRectPointCollision(obstacle);
					else if (collisionType == CollisionType.CIRCLE_RECT_LINE_INSIDE) this.handleCircleRectLineCollision(obstacle);
				}
			}
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { amount: this.amount, color: this.color });
	}
}