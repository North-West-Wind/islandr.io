import { GLOBAL_UNIT_MULTIPLIER, PUSH_THRESHOLD, TICKS_PER_SECOND } from "../../constants";
import { Entity, Inventory } from "../../types/entity";
import { PickupableEntity } from "../../types/extensions";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/math";
import { CollisionType, GunColor } from "../../types/misc";
import { Obstacle } from "../../types/obstacle";
import { GunWeapon, WeaponType } from "../../types/weapon";
import { spawnAmmo, spawnGun } from "../../utils";

export default class Player extends Entity {
	type = "player";
	hitbox = new CircleHitbox(1);
	id: string;
	username: string;
	boost = 1.5;
	scope = 2;
	tryAttacking = false;
	attackLock = 0;
	tryInteracting = false;
	canInteract = false;
	inventory: Inventory;
	// Last held weapon. Used for tracking weapon change
	lastHolding = "fists";
	normalVelocity = Vec2.ZERO;

	// Track reloading ticks
	reloadTicks = 0;
	maxReloadTicks = 0;

	constructor(id: string, username: string) {
		super();
		this.id = id;
		this.username = username;
		this.inventory = Inventory.defaultEmptyInventory();
	}

	setVelocity(velocity?: Vec2) {
		if (!velocity) velocity = this.normalVelocity;
		else this.normalVelocity = velocity;
		// Also scale the velocity to boost by soda and pills, and weight by gun
		var scale = this.boost;
		const weapon = this.inventory.getWeapon()!;
		velocity = velocity.scaleAll((this.attackLock ? weapon.attackSpeed : weapon.moveSpeed) * GLOBAL_UNIT_MULTIPLIER / TICKS_PER_SECOND);
		super.setVelocity(velocity.scaleAll(scale));
	}

	tick(entities: Entity[], obstacles: Obstacle[]) {
		// When the player dies, don't tick anything
		if (this.despawn) return;
		// Decrease attack locking timer
		// While attacking, also set moving speed
		if (this.attackLock > 0) {
			this.attackLock--;
			this.setVelocity();
		}
		// If weapon changed, re-calculate the velocity
		const weapon = this.inventory.getWeapon()!;
		//if weapon == undef then do not reset speed
		if(weapon){
			if (weapon.name != this.lastHolding) {
				this.lastHolding = weapon.name;
				this.setVelocity();
				// Allows sniper switching
				this.attackLock = 0;
				this.maxReloadTicks = this.reloadTicks = 0;
			}
		}
		super.tick(entities, obstacles);
		// Check for entity hitbox intersection
		let breaked = false;

		for (const entity of entities) {
			if (entity.hitbox.inside(this.position, entity.position, entity.direction) && (<any>entity)['picked']) {
				this.canInteract = true;
				// Only interact when trying
				if (this.tryInteracting) {
					this.canInteract = false;
					if ((<PickupableEntity><unknown>entity).picked(this)) entity.die();
				}
				breaked = true;
				break;
			}
		}
		this.tryInteracting = false;
		if (!breaked) this.canInteract = false;
		// Only attack when trying + not attacking + there's a weapon
		if (this.tryAttacking && this.attackLock <= 0 && weapon) {
			weapon.attack(this, entities, obstacles);
			this.attackLock = weapon.lock;
			this.maxReloadTicks = this.reloadTicks = 0;
			if (!weapon.auto) this.tryAttacking = false;
		}
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

		if (this.reloadTicks) {
			if (weapon.type != WeaponType.GUN) this.maxReloadTicks = this.reloadTicks = 0;
			else {
				this.reloadTicks--;
				if (!this.reloadTicks) {
					this.maxReloadTicks = 0;
					const gun = <GunWeapon> weapon;
					var delta = gun.magazine;
					gun.magazine += Math.min(gun.reloadBullets, this.inventory.ammos[gun.color]);
					if (gun.magazine > gun.capacity) gun.magazine = gun.capacity;
					else if (gun.magazine < gun.capacity && gun.reloadBullets != gun.capacity && this.inventory.ammos[gun.color]) this.maxReloadTicks = this.reloadTicks = gun.reloadTicks;
					delta -= gun.magazine;
					this.inventory.setWeapon(gun);
					this.inventory.ammos[gun.color] += delta;
				}
			}
		}
	}

	die() {
		super.die();
		for (const weapon of this.inventory.weapons) {
			if (weapon?.droppable) {
				if (weapon instanceof GunWeapon) {
					spawnGun(weapon.id, weapon.color, this.position, weapon.magazine);
					// spawnAmmo(weapon.magazine, weapon.color, this.position);
				}
			}
		}
		for (let ii = 0; ii < Object.keys(GunColor).length / 2; ii++)
			if (this.inventory.ammos[ii] > 0)
				spawnAmmo(this.inventory.ammos[ii], ii, this.position);
	}

	reload() {
		const weapon = this.inventory.getWeapon();
		if (weapon?.type != WeaponType.GUN) return;
		const gun = <GunWeapon> weapon;
		if (!this.inventory.ammos[gun.color] || gun.magazine == gun.capacity) return;
		this.maxReloadTicks = this.reloadTicks = gun.reloadTicks;
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { username: this.username, boost: this.boost, inventory: this.inventory.minimize() })
	}
}