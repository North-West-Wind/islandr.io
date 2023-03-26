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
		this.discardable = true;
		this.noCollision = true;
		this.vulnerable = false;
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
}