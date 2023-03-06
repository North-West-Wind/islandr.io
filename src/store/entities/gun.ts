// Note: This is the gun item

import { world } from "../..";
import { Entity } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CircleHitbox, CommonAngles, Vec2 } from "../../types/math";
import { GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import { GunWeapon } from "../../types/weapon";
import { castCorrectWeapon } from "../weapons";
import Player from "./player";

export default class Gun extends Entity implements PickupableEntity {
	type = "gun";
	hitbox = new CircleHitbox(2);
	name: string;
	discardable = true;
	color: GunColor;
	friction = 0.02; // frictional acceleration, not force

	constructor(name: string, color: GunColor) {
		super();
		this.name = name;
		this.color = color;
	}

	picked(player: Player) {
		// Loop through gun slots to see if there's an empty slot
		for (let ii = 0; ii < player.inventory.slots[0]; ii++) {
			if (!player.inventory.weapons[ii]) {
				player.inventory.weapons[ii] = castCorrectWeapon(this.id);
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
		const weapon = <GunWeapon>player.inventory.weapons[player.inventory.holding];
		const gun = new Gun(weapon.id, weapon.color);
		gun.position = this.position;
		gun.velocity = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun);
		// Swap the player's weapon on hand with the one on ground
		player.inventory.weapons[player.inventory.holding] = castCorrectWeapon(this.id);
		return true;
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		super.tick(entities, obstacles);
		this.velocity = this.velocity.scaleAll(1 - this.friction);
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { name: this.name, color: this.color });
	}
}