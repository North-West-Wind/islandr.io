import { MAP_SIZE } from "../constants";
import { Entity } from "./entities";
import { Vec2, Hitbox, CircleHitbox, RectHitbox, CommonAngles } from "./maths";
import { MinGameObject } from "./minimized";
import { CollisionType } from "./misc";

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

	constructor(baseHitbox: Hitbox, minHitbox: Hitbox, health: number, maxHealth: number) {
		if (baseHitbox.type !== minHitbox.type) throw new Error("Hitboxes are not the same type!");
		this.position = new Vec2((Math.random() + 1) * MAP_SIZE[0] / 2, (Math.random() + 1) * MAP_SIZE[1] / 2);
		this.direction = Vec2.ONE.addAngle(Math.random() * CommonAngles.TWO_PI);
		this.baseHitbox = this.hitbox = baseHitbox;
		this.minHitbox = minHitbox;
		this.health = health;
		this.maxHealth = maxHealth;
	}

	damage(dmg: number) {
		if (this.despawn || !this.vulnerable) return;
		this.health -= dmg;
		if (this.health <= 0) this.die();
		this.hitbox = this.baseHitbox.scaleAll(this.health / this.maxHealth + this.minHitbox.comparable() / this.baseHitbox.comparable());
	}

	die() {
		this.despawn = true;
	}

	// Hitbox collision check
	collided(thing: Entity | GameObject) {
		// For circle it is distance < sum of radii
		if (this.hitbox.type === "circle" && thing.hitbox.type === "circle") return this.position.addVec(thing.position.inverse()).magnitudeSqr() < Math.pow((<CircleHitbox>this.hitbox).radius + (<CircleHitbox>thing.hitbox).radius, 2) ? CollisionType.CIRCLE_CIRCLE : CollisionType.NONE;
		else if (this.hitbox.type === "rect" && thing.hitbox.type === "rect") {
			// https://math.stackexchange.com/questions/1278665/how-to-check-if-two-rectangles-intersect-rectangles-can-be-rotated
			// Using the last answer
			const thisStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>this.hitbox).width / 2, -(<RectHitbox>this.hitbox).height).addAngle(this.direction.angle()));
			const thingStartingPoint = this.position.addVec(new Vec2(-(<RectHitbox>thing.hitbox).width / 2, -(<RectHitbox>thing.hitbox).height).addAngle(thing.direction.angle()));
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
			if (this.hitbox.type === "circle") return check(this, thing);
			else return check(thing, this);
			function check(circle: Entity | GameObject, rect: Entity | GameObject) {
				const rectStartingPoint = rect.position.addVec(new Vec2(-(<RectHitbox>rect.hitbox).width / 2, -(<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle()));
				const rectVecs = [
					new Vec2((<RectHitbox>rect.hitbox).width, 0).addAngle(rect.direction.angle()),
					new Vec2(0, (<RectHitbox>rect.hitbox).height).addAngle(rect.direction.angle())
				];

				const ap = circle.position.addVec(rectStartingPoint.inverse());
				const apab2 = ap.magnitudeSqr() * rectVecs[0].magnitudeSqr();
				const abab2 = Math.pow(rectVecs[0].magnitudeSqr(), 2);
				const apad2 = ap.magnitudeSqr() * rectVecs[1].magnitudeSqr();
				const adad2 = Math.pow(rectVecs[1].magnitudeSqr(), 2);
				if (0 <= apab2 && apab2 <= abab2 && 0 <= apad2 && apad2 <= adad2) return CollisionType.CIRCLE_RECT_CENTER_INSIDE;
				
				const centerToCenter = circle.position.addVec(rect.position.inverse());
				if (
					centerToCenter.projectTo(rectVecs[0]).magnitude() - rectVecs[0].scaleAll(0.5).magnitude() < (<CircleHitbox>circle.hitbox).radius
					&&
					centerToCenter.projectTo(rectVecs[1]).magnitude() - rectVecs[1].scaleAll(0.5).magnitude() < (<CircleHitbox>circle.hitbox).radius
				) return CollisionType.CIRCLE_RECT_LINE_INSIDE;
				
				return CollisionType.NONE;
			}
		}
	}

	// No implementation by default
	onCollision(thing: Entity | GameObject) { }

	tick(_entities: Entity[], _objects: GameObject[]) {
		if (this.vulnerable && this.health <= 0) this.die();
	}

	rotateAround(pivot: Vec2, angle: number) {
		this.direction = this.direction.addAngle(angle);
		this.position = pivot.addVec(this.position.addVec(pivot.inverse()).addAngle(angle));
	}

	minimize() {
		return <MinGameObject> { type: this.type, position: this.position.minimize(), direction: this.direction.minimize(), hitbox: this.hitbox.minimize() };
	}
}