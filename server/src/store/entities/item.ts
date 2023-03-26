import { TICKS_PER_SECOND } from "../../constants";
import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CollisionType } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import Player from "./player";

export default abstract class Item extends Entity implements PickupableEntity {
	type = "item";
	friction = 0.02; // frictional acceleration, not force
	collisionLayers = [1];

	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		var colliding = false;
		for (const entity of entities.filter(e => e.id != this.id)) {
			if (this.collided(entity)) {
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
			const collisionType = obstacle.collided(this);
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
	
	abstract picked(player: Player): boolean;
}