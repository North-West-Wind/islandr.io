import { DEFAULT_EMPTY_INVENTORY, Entity, Inventory } from "../../types/entities";
import { CircleHitbox, RectHitbox, Vec2 } from "../../types/maths";
import { CollisionType } from "../../types/misc";
import { GameObject } from "../../types/objects";
import { randomSelect } from "../../utils";

export default class Player extends Entity {
	type = "player";
	hitbox = new CircleHitbox(1);
	id: string;
	username: string;
	boost: number = 1;
	scope: number = 1;
	tryAttacking: boolean = false;
	inventory: Inventory;

	constructor(id: string, username: string) {
		super();
		this.id = id;
		this.username = username;
		this.inventory = DEFAULT_EMPTY_INVENTORY;
	}

	setVelocity(velocity: Vec2) {
		// Also scale the velocity to boost by soda and pills
		super.setVelocity(velocity.scaleAll(this.boost));
	}

	tick(entities: Entity[], objects: GameObject[]) {
		super.tick(entities, objects);
		// Only attack when trying + no animation is playing
		if (this.tryAttacking && this.animation.duration <= 0) {
			const weapon = this.inventory.weapons[this.inventory.holding];
			if (weapon) {
				this.animation.name = randomSelect(weapon.animations);
				this.animation.duration = weapon.durations[weapon.animations.indexOf(this.animation.name)];
				if (!weapon.continuous) this.tryAttacking = false;
			}
		}
		for (const object of objects) {
			const collisionType = this.collided(object);
			if (collisionType) {
				object.onCollision(this);
				if (!object.noCollision) {
					if (collisionType == CollisionType.CIRCLE_CIRCLE) {
						const relative = this.position.addVec(object.position.inverse());
						this.position = object.position.addVec(relative.scaleAll((object.hitbox.comparable() + this.hitbox.comparable()) / relative.magnitude()));
					} else if (collisionType == CollisionType.CIRCLE_RECT_CENTER_INSIDE) {
						// TODO: implement rectangular hitbox collision
						const rectStartingPoint = object.position.addVec(new Vec2(-(<RectHitbox>object.hitbox).width / 2, -(<RectHitbox>object.hitbox).height).addAngle(object.direction.angle()));
						const rectVecs = [
							new Vec2((<RectHitbox>object.hitbox).width, 0).addAngle(object.direction.angle()),
							new Vec2(0, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle())
						];
						const centerToCenter = this.position.addVec(object.position.inverse());
					} else if (collisionType == CollisionType.CIRCLE_RECT_LINE_INSIDE) {

					}
				}
			}
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { username: this.username, boost: this.boost, inventory: this.inventory.minimize() })
	}
}