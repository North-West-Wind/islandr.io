// Note: This is the gun item

import { PUSH_THRESHOLD, TICKS_PER_SECOND } from "../../constants";
import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/math";
import { CollisionType } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import { WEAPON_SUPPLIERS } from "../weapons";
import Player from "./player";

export default class Grenade extends Entity implements PickupableEntity {
	type = "grenade";
	hitbox = new CircleHitbox(1);
	name: string; // grenade ID, but id was taken for entity already
	amount: number;
	friction = 0.02; // frictional acceleration, not force

	constructor(name: string, amount: number) {
		super();
		if (!WEAPON_SUPPLIERS.has(name)) console.warn("Creating a grenade entity that doesn't have a supplier for its type");
		this.name = name;
		this.amount = amount;
		this.discardable = true;
		this.noCollision = true;
		this.vulnerable = false;
	}

	picked(player: Player) {
		// TODO: Check if there is enough space
		player.inventory.utilities.set(this.name, (player.inventory.utilities.get(this.name) || 0) + this.amount);
		return true;
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		var colliding = false;
		for (const entity of entities.filter(e => ["grenade"].includes(e.type) && e.id != this.id)) {
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
		return Object.assign(min, { name: this.name, });
	}
}