import { ID } from "../utils";
import { Entity } from "./entity";
import { Vec2, Hitbox, CircleHitbox, RectHitbox, CommonAngles, Line } from "./math";
import { MinObstacle } from "./minimized";
import { CollisionType } from "./misc";
import { World } from "./terrain";

export class Obstacle {
	id: string;
	type = "";
	position: Vec2;
	direction: Vec2;
	baseHitbox: Hitbox;
	minHitbox: Hitbox;
	hitbox: Hitbox;
	noCollision = false;
	collisionLayers = [-1]; // -1 means on all layers
	vulnerable = true;
	health: number;
	maxHealth: number;
	discardable = false;
	despawn = false;
	animations: string[] = [];

	constructor(world: World, baseHitbox: Hitbox, minHitbox: Hitbox, health: number, maxHealth: number) {
		if (baseHitbox.type !== minHitbox.type) throw new Error("Hitboxes are not the same type!");
		this.id = ID();
		this.position = world.size.scale(Math.random(), Math.random());
		this.direction = Vec2.UNIT_X.addAngle(Math.random() * CommonAngles.TWO_PI);
		this.baseHitbox = this.hitbox = baseHitbox;
		this.minHitbox = minHitbox;
		this.health = health;
		this.maxHealth = maxHealth;
	}

	damage(dmg: number) {
		if (this.despawn || this.health <= 0 || !this.vulnerable) return;
		this.health -= dmg;
		if (this.health <= 0) this.die();
		this.hitbox = this.baseHitbox.scaleAll(this.minHitbox.comparable / this.baseHitbox.comparable + (this.health / this.maxHealth) * (1 - this.minHitbox.comparable / this.baseHitbox.comparable));
	}

	die() {
		this.despawn = true;
		this.health = 0;
	}

	// Hitbox collision check
	collided(thing: Entity | Obstacle) {
		if (this.id == thing.id || this.despawn) return CollisionType.NONE;
		if (!this.collisionLayers.includes(-1) && !thing.collisionLayers.includes(-1) && !this.collisionLayers.some(layer => thing.collisionLayers.includes(layer))) return CollisionType.NONE;
		if (this.position.distanceTo(thing.position) > this.hitbox.comparable + thing.hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2) ? CollisionType.CIRCLE_CIRCLE : CollisionType.NONE;
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height / 2).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>thing.hitbox).width / 2, -(<RectHitbox>thing.hitbox).height / 2).addAngle(thing.direction.angle()));
			const thisPoints = [
				thisStartingPoint,
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()))
			];
			const thingPoints = [
				thingStartingPoint,
				thingStartingPoint.addVec(new Vec2((<RectHitbox>thing.hitbox).width, 0).addAngle(thing.direction.angle())),
				thingStartingPoint.addVec(new Vec2(0, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle())),
				thingStartingPoint.addVec(new Vec2((<RectHitbox>thing.hitbox).width, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle()))
			];
			var results: boolean[] = Array(4);
			var ii: number;

			const thisVecs = [
				new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle()),
				new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())
			];

			const thingVecs = [
				new Vec2((<RectHitbox>thing.hitbox).width, 0).addAngle(thing.direction.angle()),
				new Vec2(0, (<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle())
			];

			for (const mainVec of thisVecs) {
				const mainMagSqr = mainVec.magnitudeSqr();
				for (ii = 0; ii < thingPoints.length; ii++)
					results[ii] = thingPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thingPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
				if (results.every(x => x)) return CollisionType.NONE;
			}

			for (const mainVec of thingVecs) {
				const mainMagSqr = mainVec.magnitudeSqr();
				for (ii = 0; ii < thisPoints.length; ii++)
					results[ii] = thisPoints[ii].addVec(thisStartingPoint.inverse()).dot(mainVec) < 0 || thisPoints[ii].addVec(thisStartingPoint.inverse()).projectTo(mainVec).magnitudeSqr() > mainMagSqr;
				if (results.every(x => x)) return CollisionType.NONE;
			}

			return CollisionType.RECT_RECT;
		} else {
			// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
			// Using the chosen answer
			// EDIT: I don't even know if this is the same answer anymore
			var circle: { hitbox: CircleHitbox, position: Vec2, direction: Vec2 };
			var rect: { hitbox: RectHitbox, position: Vec2, direction: Vec2 };
			if (this.hitbox.type === "circle") {
				circle = { hitbox: <CircleHitbox>this.hitbox, position: this.position, direction: this.direction };
				rect = { hitbox: <RectHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
			} else {
				circle = { hitbox: <CircleHitbox>thing.hitbox, position: thing.position, direction: thing.direction };
				rect = { hitbox: <RectHitbox>this.hitbox, position: this.position, direction: this.direction };
			}
			const rectStartingPoint = rect.position.addVec(new Vec2(-rect.hitbox.width / 2, -rect.hitbox.height / 2).addAngle(rect.direction.angle()));

			const rectPoints = [
				rectStartingPoint,
				rectStartingPoint.addVec(new Vec2(rect.hitbox.width, 0).addAngle(rect.direction.angle())),
				rectStartingPoint.addVec(new Vec2(rect.hitbox.width, rect.hitbox.height).addAngle(rect.direction.angle())),
				rectStartingPoint.addVec(new Vec2(0, rect.hitbox.height).addAngle(rect.direction.angle()))
			];

			if (this.pointInRect(rectPoints[0], rectPoints[1], rectPoints[2], rectPoints[3], circle.position)) return CollisionType.CIRCLE_RECT_CENTER_INSIDE;

			for (let ii = 0; ii < rectPoints.length; ii++)
				if (rectPoints[ii].addVec(circle.position.inverse()).magnitudeSqr() < Math.pow(circle.hitbox.radius, 2))
					return CollisionType.CIRCLE_RECT_POINT_INSIDE;

			for (let ii = 0; ii < rectPoints.length; ii++) {
				if (circle.hitbox.lineIntersects(new Line(rectPoints[ii], rectPoints[(ii + 1) % rectPoints.length]), circle.position))
					return CollisionType.CIRCLE_RECT_LINE_INSIDE;
			}

			return CollisionType.NONE;
		}
	}

	// No implementation by default
	onCollision(_thing: Entity | Obstacle) { }

	tick(_entities: Entity[], _obstacles: Obstacle[]) {
		if (this.vulnerable && this.health <= 0 && !this.despawn) this.die();
	}

	rotateAround(pivot: Vec2, angle: number) {
		this.direction = this.direction.addAngle(angle);
		this.position = pivot.addVec(this.position.addVec(pivot.inverse()).addAngle(angle));
	}

	minimize() {
		return <MinObstacle>{
			id: this.id,
			type: this.type,
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			hitbox: this.hitbox.minimize(),
			despawn: this.despawn,
			animations: this.animations
		};
	}

	private isLeft(a: Vec2, b: Vec2, c: Vec2) {
		return ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
	}

	private pointInRect(a: Vec2, b: Vec2, c: Vec2, d: Vec2, p: Vec2) {
		return (this.isLeft(a, b, p) > 0 && this.isLeft(b, c, p) > 0 && this.isLeft(c, d, p) > 0 && this.isLeft(d, a, p) > 0);
	}
}