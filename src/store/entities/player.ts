import { DEFAULT_EMPTY_INVENTORY, Entity, Inventory } from "../../types/entities";
import { CircleHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";

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
		for (const object of objects) {
			if (this.collided(object)) {
				object.onCollision(this);
				if (!object.noCollision) {
					if (object.hitbox.type === "circle") {
						const relative = this.position.addVec(object.position.inverse());
						this.position = object.position.addVec(relative.scaleAll((object.hitbox.comparable() + this.hitbox.comparable()) / relative.magnitude()));
					} else if (object.hitbox.type === "rect") {
						// TODO: implement rectangular hitbox collision check
					}
				}
			}
		}
	}
}