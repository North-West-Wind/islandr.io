import { world } from "..";
import { TICKS_PER_SECOND } from "../constants";
import { Bullet } from "../store/entities";
import { GunColor } from "./misc";
import { clamp } from "../utils";
import { Entity } from "./entity";
import { CommonAngles, Hitbox, Vec2 } from "./math";
import { MinWeapon } from "./minimized";
import { Obstacle } from "./obstacle";

export enum WeaponType {
	MELEE = "melee",
	GUN = "gun",
	GRENADE = "grenade"
}

export abstract class Weapon {
	id!: string;
	name!: string;
	continuous!: boolean;
	// This is handled client-side, but still needs to be sent from server
	animations!: string[];
	// Each element corresponds to an animation
	durations!: number[];
	damage!: number;
	type!: WeaponType;
	distance!: Vec2;
	rotation!: Vec2;

	abstract attack(attacker: Entity, entities: Entity[], obstacles: Obstacle[]): void;

	minimize() {
		return <MinWeapon>{ id: this.id, name: this.name };
	}
}

export abstract class MeleeWeapon extends Weapon {
	type = WeaponType.MELEE;
	hitbox!: Hitbox;
	delay!: number;
	single = true;

	// Do damage to thing. Delay handled.
	damageThing(attacker: Entity, entities: Entity[], obstacles: Obstacle[]) {
		setTimeout(() => {
			if (attacker.despawn) return;
			var combined: (Entity | Obstacle)[] = [];
			combined = combined.concat(entities, obstacles);
			const angles = this.rotation.angle() + attacker.direction.angle();
			const position = attacker.position.addVec(this.distance.addAngle(angles));

			for (const thing of combined)
				if (thing.collided(this.hitbox, position, Vec2.UNIT_X.addAngle(angles)) && thing.id != attacker.id) {
					thing.damage(this.damage);
					if (this.single) break;
				}
		}, this.delay * 1000 / TICKS_PER_SECOND);
	}
}

export abstract class GunWeapon extends Weapon {
	type = WeaponType.GUN;
	color!: GunColor;
	// Bullet speed. Unit: x units/tick
	speed!: number;
	// Accuracy: 0 to 1, where 1 means most accurate (straight line shot)
	accuracy!: number;
	// Inaccuracy: 0 to 1, the accuracy decrease when player is moving
	inaccuracy!: number;
	delay!: number;
	// A movement multiplier, should be within 0 and 1 for most cases
	weight!: number;
	ticks!: number;
	// For client side animation, calculated in in-game units
	recoil!: number;
	// Number of bullets
	bullets = 1;
	// Bullets left in the gun barrel
	barrel = 0;
	// Whether the gun is in dual state. -1: Never be dual, 0: Can be dual, but not now, 1: Dual gun
	dual = -1;

	attack(attacker: Entity, _entities: Entity[], _obstacles: Obstacle[]) {
		this.shoot(attacker);
	}

	// Spawn the bullet(s)
	shoot(attacker: Entity) {
		setTimeout(() => {
			if (!attacker.despawn && this.barrel > 0) {
				this.barrel--;
				for (let ii = 0; ii <= this.bullets; ii++) {
					var angles = this.rotation.angle() + attacker.direction.angle();
					angles += CommonAngles.PI_TWO * (Math.random() * (1 - clamp(this.accuracy - this.inaccuracy, 0, 1))) - CommonAngles.PI_FOUR;
					const position = attacker.position.addVec(this.distance.addAngle(angles));
					const bullet = new Bullet(attacker, this.damage, Vec2.UNIT_X.addAngle(angles).scaleAll(this.speed), this.ticks);
					bullet.position = position;
					world.entities.push(bullet);
				}
			}
		}, this.delay * 1000 / TICKS_PER_SECOND);
	}
}