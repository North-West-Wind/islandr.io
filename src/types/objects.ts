import { MAP_SIZE } from "../constants";
import { Entity } from "./entities";
import { Vec2, Hitbox, CircleHitbox, RectHitbox, CommonAngles, Line } from "./maths";
import { MinGameObject } from "./minimized";
import { Animation, CollisionType } from "./misc";

export class GameObject {
	type: string = "";
	position: Vec2;
	direction: Vec2;
	baseHitbox: Hitbox;
	minHitbox: Hitbox;
	hitbox: Hitbox;
	noCollision = false;
	vulnerable = true;
	health: number;
	maxHealth: number;
	discardable = false;
	despawn = false;
	animation: Animation = { name: "", duration: 0 };

	constructor(baseHitbox: Hitbox, minHitbox: Hitbox, health: number, maxHealth: number) {
		if (baseHitbox.type !== minHitbox.type) throw new Error("Hitboxes are not the same type!");
		this.position = new Vec2(Math.random() * MAP_SIZE[0], Math.random() * MAP_SIZE[1]);
		this.direction = Vec2.ONE.addAngle(Math.random() * CommonAngles.TWO_PI);
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
	collided(hitbox: Hitbox, position: Vec2, direction: Vec2) {
		if (this.despawn) return CollisionType.NONE;
		if (this.position.distanceTo(position) > this.hitbox.comparable + hitbox.comparable) return CollisionType.NONE;
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && hitbox.type === "circle") return this.position.addVec(position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>hitbox).radius, 2) ? CollisionType.CIRCLE_CIRCLE : CollisionType.NONE;
		else if (this.hitbox.type === "rect" && hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height / 2).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>hitbox).width / 2, -(<RectHitbox>hitbox).height / 2).addAngle(direction.angle()));
			const thisPoints = [
				thisStartingPoint,
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())),
				thisStartingPoint.addVec(new Vec2((<RectHitbox>this.hitbox).width, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()))
			];
			const thingPoints = [
				thingStartingPoint,
				thingStartingPoint.addVec(new Vec2((<RectHitbox>hitbox).width, 0).addAngle(direction.angle())),
				thingStartingPoint.addVec(new Vec2(0, (<RectHitbox>hitbox).height).addAngle(direction.angle())),
				thingStartingPoint.addVec(new Vec2((<RectHitbox>hitbox).width, (<RectHitbox>hitbox).height).addAngle(direction.angle()))
			];
			var results: boolean[] = Array(4);
			var ii: number;

			const thisVecs = [
				new Vec2((<RectHitbox>this.hitbox).width, 0).addAngle(this.direction.angle()),
				new Vec2(0, (<RectHitbox>this.hitbox).height).addAngle(this.direction.angle())
			];

			const thingVecs = [
				new Vec2((<RectHitbox>hitbox).width, 0).addAngle(direction.angle()),
				new Vec2(0, (<RectHitbox>hitbox).height).addAngle(direction.angle())
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
			var circle: { hitbox: CircleHitbox, position: Vec2, direction: Vec2 };
			var rect: { hitbox: RectHitbox, position: Vec2, direction: Vec2 };
			if (this.hitbox.type === "circle") {
				circle = { hitbox: <CircleHitbox>this.hitbox, position: this.position, direction: this.direction };
				rect = { hitbox: <RectHitbox>hitbox, position, direction };
			} else {
				circle = { hitbox: <CircleHitbox>hitbox, position, direction };
				rect = { hitbox: <RectHitbox>this.hitbox, position: this.position, direction: this.direction };
			}
			const rectStartingPoint = rect.position.addVec(new Vec2(-rect.hitbox.width / 2, -rect.hitbox.height / 2).addAngle(rect.direction.angle()));
			const rectVecs = [
				new Vec2(rect.hitbox.width, 0).addAngle(rect.direction.angle()),
				new Vec2(0, rect.hitbox.height).addAngle(rect.direction.angle())
			];

			/*const ap = circle.position.addVec(rectStartingPoint.inverse());
			const apab2 = ap.magnitudeSqr() * rectVecs[0].magnitudeSqr();
			const abab2 = Math.pow(rectVecs[0].magnitudeSqr(), 2);
			const apad2 = ap.magnitudeSqr() * rectVecs[1].magnitudeSqr();
			const adad2 = Math.pow(rectVecs[1].magnitudeSqr(), 2);
			if (0 <= apab2 && apab2 <= abab2 && 0 <= apad2 && apad2 <= adad2) return CollisionType.CIRCLE_RECT_CENTER_INSIDE;*/

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

			for (let ii = 0; ii < rectPoints.length; ii++)
				if (circle.hitbox.lineIntersects(new Line(rectPoints[ii], rectPoints[(ii + 1) % rectPoints.length]), circle.position))
					return CollisionType.CIRCLE_RECT_LINE_INSIDE;

			return CollisionType.NONE;
		}
	}

	// No implementation by default
	onCollision(thing: Entity | GameObject) { }

	tick(_entities: Entity[], _objects: GameObject[]) {
		if (this.vulnerable && this.health <= 0 && !this.despawn) this.die();
	}

	rotateAround(pivot: Vec2, angle: number) {
		this.direction = this.direction.addAngle(angle);
		this.position = pivot.addVec(this.position.addVec(pivot.inverse()).addAngle(angle));
	}

	minimize() {
		return <MinGameObject>{
			type: this.type,
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			hitbox: this.hitbox.minimize(),
			despawn: this.despawn
		};
	}

	private isLeft(a: Vec2, b: Vec2, c: Vec2) {
		return ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
	}

	private pointInRect(a: Vec2, b: Vec2, c: Vec2, d: Vec2, p: Vec2) {
		return (this.isLeft(a, b, p) > 0 && this.isLeft(b, c, p) > 0 && this.isLeft(c, d, p) > 0 && this.isLeft(d, a, p) > 0);
	}
}