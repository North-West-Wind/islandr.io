import { DEFAULT_EMPTY_INVENTORY, Entity, Inventory } from "../../types/entities";
import { CircleHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { randomSelect } from "../../utils";

export default class Player extends Entity {
	type = "player";
	hitbox = new CircleHitbox(1);
	id: string;
	boost: number = 1;
	scope: number = 1;
	tryAttacking: boolean = false;
	inventory: Inventory;

	constructor(id: string) {
		super();
		this.id = id;
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
			if (this.collided(object)) {
				object.onCollision(this);
				if (!object.noCollision) {
					if (object.hitbox.type === "circle") {
						const relative = this.position.addVec(object.position.inverse());
						this.position = object.position.addVec(relative.scaleAll((object.hitbox.comparable() + this.hitbox.comparable()) / relative.magnitude()));
					} else if (object.hitbox.type === "rect") {
						// TODO: implement rectangular hitbox collision
					}
				}
			}
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { boost: this.boost, inventory: this.inventory.minimize() })
	}
}