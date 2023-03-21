// Note: This is the gun item

import { world } from "../..";
import { PUSH_THRESHOLD, TICKS_PER_SECOND } from "../../constants";
import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CircleHitbox, CommonAngles, Line, RectHitbox, Vec2 } from "../../types/math";
import { CollisionType, GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import { GunWeapon } from "../../types/weapon";
import { castCorrectWeapon, WEAPON_SUPPLIERS } from "../weapons";
import Player from "./player";

export default class Gun extends Entity implements PickupableEntity {
	type = "gun";
	hitbox = new CircleHitbox(2);
	name: string; // Gun ID, but id was taken for entity already
	discardable = true;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force

	constructor(name: string, color: GunColor) {
		super();
		if (!WEAPON_SUPPLIERS.has(name)) console.warn("Creating a gun entity that doesn't have a supplier for its type");
		this.name = name;
		this.color = color;
	}

	picked(player: Player) {
		// Loop through gun slots to see if there's an empty slot
		for (let ii = 0; ii < player.inventory.slots[0]; ii++) {
			if (!player.inventory.getWeapon(ii)) {
				player.inventory.setWeapon(castCorrectWeapon(this.name), ii);
				// If player is holding a melee weapon, automatically switch to the gun
				if (player.inventory.holding >= player.inventory.slots[0] && player.inventory.holding < player.inventory.slots[0] + player.inventory.slots[1])
					player.inventory.holding = ii;
				return true;
			}
		}
		// There is no empty gun slot
		// If player is holding melee weapon, don't switch
		if (player.inventory.holding >= player.inventory.slots[0]) return false;
		// Spawn swapped weapon
		const weapon = <GunWeapon>player.inventory.getWeapon();
		const gun = new Gun(weapon.id, weapon.color);
		gun.position = this.position;
		gun.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun);
		// Swap the player's weapon on hand with the one on ground
		player.inventory.setWeapon(castCorrectWeapon(this.name));
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
		return Object.assign(min, { name: this.name, color: this.color });
	}

	private handleCircleCircleCollision(obstacle: Obstacle) {
		const relative = this.position.addVec(obstacle.position.inverse());
		this.position = obstacle.position.addVec(relative.scaleAll((obstacle.hitbox.comparable + this.hitbox.comparable) / relative.magnitude()));
	}

	private handleCircleRectCenterCollision(obstacle: Obstacle) {
		const rectVecs = [
			new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle()),
			new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())
		];
		const centerToCenter = this.position.addVec(obstacle.position.inverse());
		/* In the order of right up left down
		 * Think of the rectangle as vectors
		 *       up vec0
		 *      +------->
		 *      |
		 * left |        right
		 * vec1 |
		 *      v
		 *         down
		 */
		const horiProject = centerToCenter.projectTo(rectVecs[0]);
		const vertProject = centerToCenter.projectTo(rectVecs[1]);
		// Distances between center and each side
		const distances = [
			rectVecs[0].scaleAll(0.5).addVec(horiProject.inverse()),
			rectVecs[1].scaleAll(-0.5).addVec(vertProject.inverse()),
			rectVecs[0].scaleAll(-0.5).addVec(horiProject.inverse()),
			rectVecs[1].scaleAll(0.5).addVec(vertProject.inverse())
		];
		var shortestIndex = 0;
		for (let ii = 1; ii < distances.length; ii++)
			if (distances[ii].magnitudeSqr() < distances[shortestIndex].magnitudeSqr())
				shortestIndex = ii;

		this.position = this.position.addVec(distances[shortestIndex]).addVec(distances[shortestIndex].unit().scaleAll(this.hitbox.comparable));
	}

	private handleCircleRectPointCollision(obstacle: Obstacle) {
		const rectStartingPoint = obstacle.position.addVec(new Vec2(-(<RectHitbox>obstacle.hitbox).width / 2, -(<RectHitbox>obstacle.hitbox).height / 2).addAngle(obstacle.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle()))
		];
		const intersections = Array(rectPoints.length).fill(false);
		var counts = 0
		for (let ii = 0; ii < rectPoints.length; ii++)
			if (rectPoints[ii].distanceSqrTo(this.position) <= this.hitbox.radius) {
				intersections[ii] = true;
				counts++;
			}
		if (counts == 2) return this.handleCircleRectLineCollision(obstacle);
		var sum = 0;
		for (let ii = 0; ii < intersections.length; ii++)
			if (intersections[ii])
				sum += ii;
		const index = sum / counts;
		const adjacents = [
			rectPoints[((index - 1) < 0 ? rectPoints.length : index) - 1],
			rectPoints[index],
			rectPoints[(index + 1) % rectPoints.length]
		];
		const vecs = [
			adjacents[1].addVec(adjacents[0].inverse()),
			adjacents[2].addVec(adjacents[1].inverse())
		];

		for (let ii = 0; ii < vecs.length; ii++) {
			const distance = new Line(adjacents[ii], adjacents[ii+1]).distanceTo(this.position);
			this.position = this.position.addVec(vecs[ii].perpendicular().unit().scaleAll(this.hitbox.radius - distance));
		}
	}

	private handleCircleRectLineCollision(obstacle: Obstacle) {
		const rectStartingPoint = obstacle.position.addVec(new Vec2(-(<RectHitbox>obstacle.hitbox).width / 2, -(<RectHitbox>obstacle.hitbox).height / 2).addAngle(obstacle.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, 0).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>obstacle.hitbox).width, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>obstacle.hitbox).height).addAngle(obstacle.direction.angle()))
		];
		const distances: number[] = Array(rectPoints.length);
		const vecs: Vec2[] = Array(rectPoints.length);
		for (let ii = 0; ii < rectPoints.length; ii++) {
			const point1 = rectPoints[ii], point2 = rectPoints[(ii + 1) % rectPoints.length];
			vecs[ii] = point2.addVec(point1.inverse());
			distances[ii] = new Line(point1, point2).distanceTo(this.position);
		}
		var shortestIndex = 0;
		for (let ii = 1; ii < distances.length; ii++)
			if (distances[ii] < distances[shortestIndex])
				shortestIndex = ii;
		
		const push = vecs[shortestIndex].perpendicular().unit().scaleAll(this.hitbox.radius - distances[shortestIndex]);
		if (Math.abs(push.y) < PUSH_THRESHOLD && Math.abs(push.x) < PUSH_THRESHOLD) return;
		this.position = this.position.addVec(push);
	}
}