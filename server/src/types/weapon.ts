import { world } from "..";
import { GLOBAL_UNIT_MULTIPLIER, TICKS_PER_SECOND } from "../constants";
import { Bullet } from "../store/entities";
import { GunColor } from "./misc";
import { randomBetween, toRadians } from "../utils";
import { Entity } from "./entity";
import { CircleHitbox, Hitbox, Vec2 } from "./math";
import { MinWeapon } from "./minimized";
import { Obstacle } from "./obstacle";
import { BulletStats, GunData, MeleeData, TracerData } from "./data";

export enum WeaponType {
	MELEE = "melee",
	GUN = "gun",
	GRENADE = "grenade"
}

export abstract class Weapon {
	type!: WeaponType;
	id: string;
	name: string;
	lock: number;
	moveSpeed: number;
	attackSpeed: number;
	auto: boolean;
	droppable: boolean;

	constructor(id: string, name: string, lock: number, moveSpeed: number, attackSpeed: number, auto: boolean, droppable: boolean) {
		this.id = id;
		this.name = name;
		this.lock = lock;
		this.moveSpeed = moveSpeed;
		this.attackSpeed = attackSpeed;
		this.auto = auto;
		this.droppable = droppable;
	}

	abstract attack(attacker: Entity, entities: Entity[], obstacles: Obstacle[]): void;

	minimize() {
		return <MinWeapon>{ id: this.id, name: this.name };
	}
}

export class MeleeWeapon extends Weapon {
	type = WeaponType.MELEE;
	offset: Vec2;
	hitbox: Hitbox;
	damage: number;
	delay: number;
	animations: string[];
	cleave: boolean;

	constructor(id: string, data: MeleeData) {
		super(id, data.name, (data.normal.cooldown / 1000) * TICKS_PER_SECOND, data.normal.speed.equip, data.normal.speed.attack, data.auto || false, data.droppable);
		this.offset = new Vec2(data.normal.offset.x, data.normal.offset.y).scaleAll(GLOBAL_UNIT_MULTIPLIER);
		this.hitbox = new CircleHitbox(data.normal.radius);
		this.damage = data.normal.damage;
		this.delay = data.normal.damageDelay;
		this.animations = data.visuals.animations;
		this.cleave = data.normal.cleave || false;
	}

	attack(attacker: Entity, entities: Entity[], obstacles: Obstacle[]): void {
		const index = Math.floor(Math.random() * this.animations.length);
		attacker.animations.push(this.animations[index]);

		this.damageThing(attacker, entities, obstacles);
	}

	// Do damage to thing. Delay handled.
	damageThing(attacker: Entity, entities: Entity[], obstacles: Obstacle[]) {
		setTimeout(() => {
			if (attacker.despawn) return;
			var combined: (Entity | Obstacle)[] = [];
			combined = combined.concat(entities, obstacles);
			const position = attacker.position.addVec(this.offset.addAngle(attacker.direction.angle()));
			const dummy = new Entity();
			dummy.hitbox = this.hitbox;
			dummy.position = position;
			dummy.direction = attacker.direction;
			for (const thing of combined)
				if (thing.collided(dummy) && thing.id != attacker.id) {
					thing.damage(this.damage);
					if (!this.cleave) break;
				}
		}, this.delay);
	}
}

export class GunWeapon extends Weapon {
	// More like constants
	type = WeaponType.GUN;
	color: GunColor;
	ammo: number; // Ammo spawn
	bullets: number;
	spread: number;
	moveSpread: number;
	offset: Vec2;
	bullet: BulletStats;
	tracer: TracerData;
	reloadTicks: number;
	reloadBullets: number;
	capacity: number;

	// Actual variables
	magazine = 0;

	constructor(id: string, data: GunData) {
		super(id, data.name, (data.normal.delay.firing / 1000) * TICKS_PER_SECOND, data.normal.speed.equip, data.normal.speed.attack, data.auto || false, data.droppable);
		this.color = data.color;
		this.ammo = data.ammo;
		this.bullets = data.normal.bullets;
		this.spread = data.normal.spread.still;
		this.moveSpread = data.normal.spread.still;
		this.offset = new Vec2(data.length, 0);
		this.bullet = data.normal.bullet;
		this.tracer = data.visuals.tracer;
		this.reloadTicks = (data.normal.reload.time / 1000) * TICKS_PER_SECOND;
		this.reloadBullets = data.normal.reload.bullets || data.normal.capacity;
		this.capacity = data.normal.capacity;
	}

	attack(attacker: Entity, _entities: Entity[], _obstacles: Obstacle[]) {
		this.shoot(attacker);
	}

	// Spawn the bullet(s)
	shoot(attacker: Entity) {
		if (!attacker.despawn && this.magazine > 0) {
			this.magazine--;
			for (let ii = 0; ii < this.bullets; ii++) {
				var angles = attacker.direction.angle() + toRadians((Math.random() - 0.5) * (attacker.velocity.magnitudeSqr() != 0 ? this.moveSpread : this.spread));
				const position = attacker.position.addVec(this.offset.addAngle(attacker.direction.angle()));
				const bullet = new Bullet(attacker, this.bullet.damage, Vec2.UNIT_X.addAngle(angles).scaleAll(this.bullet.speed / TICKS_PER_SECOND), randomBetween(this.bullet.range[0], this.bullet.range[1]) / (this.bullet.speed / TICKS_PER_SECOND), this.bullet.falloff, this.tracer);
				bullet.position = position;
				world.entities.push(bullet);
			}
		}
	}
}

export class GrenadeWeapon extends Weapon {
	type = WeaponType.GRENADE;
	// Bullet speed. Unit: x units/tick

	constructor(id: string, name: string) {
		super(id, name, 0, 13, 13, false, true);
	}


	attack(attacker: Entity, _entities: Entity[], _obstacles: Obstacle[]) {
		this.attack(attacker, _entities, _obstacles);
	}

	// Spawn the bullet(s)
	// shoot(attacker: Entity) {
	// 	setTimeout(() => {
	// 		if (!attacker.despawn && this.magazine > 0) {
	// 			this.magazine--;
	// 			for (let ii = 0; ii <= this.bullets; ii++) {
	// 				var angles = this.rotation.angle() + attacker.direction.angle();
	// 				angles += CommonAngles.PI_TWO * (Math.random() * (1 - clamp(this.accuracy - this.inaccuracy, 0, 1))) - CommonAngles.PI_FOUR;
	// 				const position = attacker.position.addVec(this.distance.addAngle(angles));
	// 				const bullet = new Bullet(attacker, this.damage, Vec2.UNIT_X.addAngle(angles).scaleAll(this.speed), this.ticks);
	// 				bullet.position = position;
	// 				world.entities.push(bullet);
	// 			}
	// 		}
	// 	}, this.delay * 1000 / TICKS_PER_SECOND);}
}