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
						const rectVecs = [
							new Vec2((<RectHitbox>object.hitbox).width, 0).addAngle(object.direction.angle()),
							new Vec2(0, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle())
						];
						const centerToCenter = this.position.addVec(object.position.inverse());
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

						this.position = this.position.addVec(distances[shortestIndex]).addVec(distances[shortestIndex].unit().scaleAll(this.hitbox.comparable()));
					} else if (collisionType == CollisionType.CIRCLE_RECT_LINE_INSIDE) {
						const rectVecs = [
							new Vec2((<RectHitbox>object.hitbox).width, 0).addAngle(object.direction.angle()),
							new Vec2(0, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle())
						];
						const centerToCenter = this.position.addVec(object.position.inverse());
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
							horiProject.addVec(rectVecs[0].scaleAll(-0.5)),
							vertProject.addVec(rectVecs[1].scaleAll(0.5)),
							horiProject.addVec(rectVecs[0].scaleAll(0.5)),
							vertProject.addVec(rectVecs[1].scaleAll(-0.5))
						];
						const rectStartingPoint = object.position.addVec(new Vec2(-(<RectHitbox>object.hitbox).width / 2, -(<RectHitbox>object.hitbox).height).addAngle(object.direction.angle()));
						const ap = this.position.addVec(rectStartingPoint.inverse());
						const apab2 = ap.dot(rectVecs[0]);
						const apad2 = ap.dot(rectVecs[1]);
						if (0 <= apab2 && apab2 * apab2 <= rectVecs[0].magnitudeSqr()) {
							distances.splice(0, 1);
							distances.splice(1, 1);
						} else if (0 <= apad2 && apad2 * apad2 <= rectVecs[1].magnitudeSqr()) {
							distances.splice(1, 1);
							distances.splice(2, 1);
						}
						var shortestIndex = 0;
						for (let ii = 0; ii < distances.length; ii++)
							if (distances[ii].magnitudeSqr() < distances[shortestIndex].magnitudeSqr())
								shortestIndex = ii;

						this.position = this.position.addVec(distances[shortestIndex].unit().scaleAll(this.hitbox.comparable())).addVec(distances[shortestIndex].inverse());
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