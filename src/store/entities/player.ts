import { PUSH_THRESHOLD } from "../../constants";
import { DEFAULT_EMPTY_INVENTORY, Entity, Inventory } from "../../types/entities";
import { CircleHitbox, Line, RectHitbox, Vec2 } from "../../types/maths";
import { CollisionType } from "../../types/misc";
import { GameObject } from "../../types/objects";

export default class Player extends Entity {
	type = "player";
	hitbox = new CircleHitbox(1);
	id: string;
	username: string;
	boost: number = 2;
	scope: number = 2;
	tryAttacking: boolean = false;
	inventory: Inventory;

	constructor(id: string, username: string) {
		super();
		this.id = id;
		this.username = username;
		this.inventory = DEFAULT_EMPTY_INVENTORY;
		this.position = new Vec2(1, 1);
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
				weapon.attack(this, entities, objects);
				if (!weapon.continuous) this.tryAttacking = false;
			}
		}
		for (const object of objects) {
			const collisionType = object.collided(this.hitbox, this.position, this.direction);
			if (collisionType) {
				object.onCollision(this);
				if (!object.noCollision) {
					if (collisionType == CollisionType.CIRCLE_CIRCLE) this.handleCircleCircleCollision(object);
					else if (collisionType == CollisionType.CIRCLE_RECT_CENTER_INSIDE) this.handleCircleRectCenterCollision(object);
					else if (collisionType == CollisionType.CIRCLE_RECT_POINT_INSIDE) this.handleCircleRectPointCollision(object);
					else if (collisionType == CollisionType.CIRCLE_RECT_LINE_INSIDE) this.handleCircleRectLineCollision(object);
				}
			}
		}
	}

	minimize() {
		const min = super.minimize();
		return Object.assign(min, { username: this.username, boost: this.boost, inventory: this.inventory.minimize() })
	}

	private handleCircleCircleCollision(object: GameObject) {
		const relative = this.position.addVec(object.position.inverse());
		this.position = object.position.addVec(relative.scaleAll((object.hitbox.comparable + this.hitbox.comparable) / relative.magnitude()));
	}

	private handleCircleRectCenterCollision(object: GameObject) {
		console.log("center in rectangle!")
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

		this.position = this.position.addVec(distances[shortestIndex]).addVec(distances[shortestIndex].unit().scaleAll(this.hitbox.comparable));
	}

	private handleCircleRectPointCollision(object: GameObject) {
		console.log("point in circle!")
		const rectStartingPoint = object.position.addVec(new Vec2(-(<RectHitbox>object.hitbox).width / 2, -(<RectHitbox>object.hitbox).height / 2).addAngle(object.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>object.hitbox).width, 0).addAngle(object.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>object.hitbox).width, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle()))
		];
		const intersections = Array(rectPoints.length).fill(false);
		var counts = 0
		for (let ii = 0; ii < rectPoints.length; ii++)
			if (rectPoints[ii].distanceSqrTo(this.position) <= this.hitbox.radius) {
				intersections[ii] = true;
				counts++;
			}
		if (counts == 0) return console.log("wtf?");
		if (counts == 2) return this.handleCircleRectLineCollision(object);
		var sum = 0;
		for (let ii = 0; ii < intersections.length; ii++)
			if (intersections[ii])
				sum += ii;
		const index = sum / counts;
		console.log(index);
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

	private handleCircleRectLineCollision(object: GameObject) {
		console.log("line in circle!")
		const rectStartingPoint = object.position.addVec(new Vec2(-(<RectHitbox>object.hitbox).width / 2, -(<RectHitbox>object.hitbox).height / 2).addAngle(object.direction.angle()));
		const rectPoints = [
			rectStartingPoint,
			rectStartingPoint.addVec(new Vec2((<RectHitbox>object.hitbox).width, 0).addAngle(object.direction.angle())),
			rectStartingPoint.addVec(new Vec2((<RectHitbox>object.hitbox).width, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle())),
			rectStartingPoint.addVec(new Vec2(0, (<RectHitbox>object.hitbox).height).addAngle(object.direction.angle()))
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
		console.log(push)
		this.position = this.position.addVec(push);
	}
}